from django.shortcuts import render, get_object_or_404
import requests
from django.conf import settings
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from accounts.models import CustomUser
from .models import RiskAssessment

# Create your views here.

def get_recommendations(risk_type, risk_score):
    """Generate preventive recommendations based on risk type and score."""
    recommendations = []
    
    # Common recommendations for all risk levels
    common_recommendations = {
        'heart': [
            "Maintain a balanced diet rich in fruits, vegetables, whole grains, and lean proteins",
            "Engage in regular physical activity (aim for at least 150 minutes of moderate activity per week)",
            "Avoid tobacco products and limit alcohol consumption",
            "Manage stress through techniques like meditation, deep breathing, or yoga"
        ],
        'diabetes': [
            "Focus on a balanced diet with plenty of fiber and minimal processed foods",
            "Maintain a healthy weight through regular exercise",
            "Stay hydrated by drinking plenty of water",
            "Get adequate sleep (7-8 hours per night)"
        ]
    }
    
    # Add common recommendations
    recommendations.extend(common_recommendations.get(risk_type, []))
    
    # Add specific recommendations based on risk level
    if risk_type == 'heart':
        if risk_score >= 20:  # High risk
            recommendations.extend([
                "Consider discussing statin therapy with your healthcare provider",
                "Monitor blood pressure regularly and maintain it below 130/80 mmHg",
                "Reduce sodium intake to less than 1,500 mg per day",
                "Consider a Mediterranean diet or DASH diet approach",
                "Aim for at least 30 minutes of moderate exercise 5-7 days per week"
            ])
        elif risk_score >= 10:  # Moderate risk
            recommendations.extend([
                "Monitor blood pressure regularly and maintain it below 140/90 mmHg",
                "Limit sodium intake and processed foods",
                "Consider increasing omega-3 fatty acids in your diet (fish, walnuts, flaxseeds)",
                "Aim for at least 150 minutes of moderate exercise per week"
            ])
        else:  # Low risk
            recommendations.extend([
                "Maintain healthy blood pressure through diet and exercise",
                "Stay active throughout the day - avoid prolonged sitting",
                "Consider regular health check-ups to monitor cardiovascular health"
            ])
    
    elif risk_type == 'diabetes':
        if risk_score >= 20:  # High risk
            recommendations.extend([
                "Consider consulting with a dietitian for a personalized meal plan",
                "Monitor carbohydrate intake and focus on low glycemic index foods",
                "Aim for at least 30 minutes of moderate exercise 5-7 days per week",
                "Consider regular blood glucose screening",
                "Maintain a healthy weight - losing even 5-7% of body weight can significantly reduce risk"
            ])
        elif risk_score >= 10:  # Moderate risk
            recommendations.extend([
                "Limit added sugars and refined carbohydrates in your diet",
                "Include more fiber-rich foods to help regulate blood sugar",
                "Stay active with a mix of cardio and strength training exercises",
                "Consider periodic blood glucose screening"
            ])
        else:  # Low risk
            recommendations.extend([
                "Maintain healthy eating habits with balanced meals",
                "Stay active throughout the day",
                "Consider regular health check-ups to monitor metabolic health"
            ])
    
    return recommendations

class RiskPredictionView(APIView):
    def post(self, request):
        external_url = 'https://api.endeavourpredict.org/dev/epredict/Prediction'
        api_key = '90a3763f-4ffb-41eb-bee2-369ed972c1a0'
        payload = request.data
        
        # Extract user_id from request data
        user_id = request.data.get('user_id')
        
        # Get the condition type from requested engines
        condition_type = 'heart'  # Default
        if 'requestedEngines' in payload:
            if 'QDiabetes' in payload['requestedEngines']:
                condition_type = 'diabetes'
            elif 'QRisk3' in payload['requestedEngines']:
                condition_type = 'heart'
        
        # Remove user_id from payload before sending to external API
        if 'user_id' in payload:
            payload_copy = payload.copy()
            payload_copy.pop('user_id')
        else:
            payload_copy = payload
            
        headers = {
            'accept': 'application/json',
            'X-Gravitee-Api-Key': api_key,
            'Content-Type': 'application/json',
        }
        try:
            response = requests.post(external_url, json=payload_copy, headers=headers, timeout=15)
            if response.status_code == 200:
                data = response.json()
                # Parse important fields
                result = {
                    'riskScore': None,
                    'heartAge': None,
                    'typicalScore': None,
                    'calculationMeta': None,
                    'message': None,
                    'recommendations': [],
                    'risk_assessment_id': None  # Will be populated if result is saved
                }
                try:
                    engine_results = data.get('engineResults', [])
                    if engine_results:
                        qrisk = engine_results[0]
                        # Find risk score and heart age
                        for r in qrisk.get('results', []):
                            if r.get('id', '').endswith('Qrisk3'):
                                result['riskScore'] = r.get('score')
                                result['typicalScore'] = r.get('typicalScore')
                                # Add heart risk recommendations
                                if result['riskScore'] is not None:
                                    result['recommendations'] = get_recommendations('heart', result['riskScore'])
                            elif r.get('id', '').endswith('QDiabetes'):
                                result['riskScore'] = r.get('score')
                                result['typicalScore'] = r.get('typicalScore')
                                # Add diabetes risk recommendations
                                if result['riskScore'] is not None:
                                    result['recommendations'] = get_recommendations('diabetes', result['riskScore'])
                            if r.get('id', '').endswith('Qrisk3HeartAge'):
                                result['heartAge'] = r.get('score')
                        # Calculation meta
                        meta = qrisk.get('calculationMeta', {})
                        result['calculationMeta'] = {
                            'engineResultStatus': meta.get('engineResultStatus'),
                            'engineResultStatusReason': meta.get('engineResultStatusReason')
                        }
                        # Message
                        if qrisk.get('results') and len(qrisk['results']) > 0:
                            result['message'] = qrisk['results'][0].get('message')
                            
                        # Save the result to database if user_id is provided
                        if user_id and result['riskScore'] is not None:
                            try:
                                user = get_object_or_404(CustomUser, id=user_id)
                                assessment = RiskAssessment(
                                    user=user,
                                    condition=condition_type,
                                    risk_score=result['riskScore'],
                                    heart_age=result['heartAge'],
                                    typical_score=result['typicalScore'],
                                    recommendations=result['recommendations']
                                )
                                assessment.save()
                                result['risk_assessment_id'] = str(assessment.risk_assessment_id)
                            except Exception as e:
                                # Log the error but continue with the response
                                print(f"Error saving assessment: {str(e)}")
                                
                except Exception as e:
                    result['message'] = f'Error parsing response: {str(e)}'
                return Response(result, status=status.HTTP_200_OK)
            else:
                return Response({
                    'error': 'External API error',
                    'status_code': response.status_code,
                    'details': response.text
                }, status=status.HTTP_502_BAD_GATEWAY)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
            
    def get(self, request, user_id=None):
        """Fetch risk assessment history for a user"""
        if not user_id:
            return Response({"error": "User ID is required"}, status=status.HTTP_400_BAD_REQUEST)
            
        try:
            # Verify the user exists
            user = get_object_or_404(CustomUser, id=user_id)
            
            # Get assessments for the user
            assessments = RiskAssessment.objects.filter(user=user).order_by('-created_at')
            
            # Format the response
            assessment_list = []
            for assessment in assessments:
                assessment_list.append({
                    'risk_assessment_id': str(assessment.risk_assessment_id),
                    'condition': assessment.condition,
                    'risk_score': assessment.risk_score,
                    'heart_age': assessment.heart_age,
                    'typical_score': assessment.typical_score,
                    'recommendations': assessment.recommendations,
                    'created_at': assessment.created_at.isoformat()
                })
                
            return Response(assessment_list, status=status.HTTP_200_OK)
            
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
