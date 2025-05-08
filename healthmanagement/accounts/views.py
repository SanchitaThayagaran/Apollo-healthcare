import requests
from django.conf import settings
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from .models import CustomUser
from rest_framework_simplejwt.tokens import RefreshToken

class GoogleLoginView(APIView):
    def post(self, request):
        # Step 1: Extract token from the request
        token = request.data.get('token')
        if not token:
            return Response({"error": "Token is required."}, status=status.HTTP_400_BAD_REQUEST)

        # Step 2: Verify token with Google API
        response = requests.get(f'https://www.googleapis.com/oauth2/v3/tokeninfo?id_token={token}')
        if response.status_code != 200:
            return Response({"error": "Invalid token."}, status=status.HTTP_400_BAD_REQUEST)

        # Step 3: Extract user information from the response
        user_info = response.json()
        email = user_info.get('email')

        # Check if email exists
        if not email:
            return Response({"error": "Email not found in token."}, status=status.HTTP_400_BAD_REQUEST)

        # Step 4: Check role based on email domain or static list
        # For now, we assume doctors are from a predefined list of emails or domain
        doctor_emails = ['doctor1@example.com', 'doctor2@example.com']  # Update with your actual doctor emails or logic
        role = 'doctor' if email in doctor_emails else 'patient'

        # Step 5: Get or create user in the database
        user, created = CustomUser.objects.get_or_create(
            email=email,
            defaults={'username': email, 'role': role},
        )

        # If the user already exists and role is not set, update the role
        if not created and user.role != role:
            user.role = role
            user.save()

        # Step 6: Issue JWT tokens for the user
        refresh = RefreshToken.for_user(user)
        access_token = str(refresh.access_token)
        refresh_token = str(refresh)

        # Step 7: Return the tokens and role in the response
        return Response({
            'access': access_token,
            'refresh': refresh_token,
            'role': user.role
        }, status=status.HTTP_200_OK)


class RiskPredictionView(APIView):
    def post(self, request):
        external_url = 'https://api.endeavourpredict.org/dev/epredict/Prediction'
        api_key = '90a3763f-4ffb-41eb-bee2-369ed972c1a0'
        payload = request.data
        headers = {
            'accept': 'application/json',
            'X-Gravitee-Api-Key': api_key,
            'Content-Type': 'application/json',
        }
        try:
            response = requests.post(external_url, json=payload, headers=headers, timeout=15)
            if response.status_code == 200:
                data = response.json()
                # Parse important fields
                result = {
                    'riskScore': None,
                    'heartAge': None,
                    'typicalScore': None,
                    'calculationMeta': None,
                    'message': None
                }
                try:
                    engine_results = data.get('engineResults', [])
                    if engine_results:
                        qrisk = engine_results[0]
                        # Find risk score and heart age
                        for r in qrisk.get('results', []):
                            if r.get('id', '').endswith('Qrisk3') or r.get('id', '').endswith('QDiabetes'):
                                result['riskScore'] = r.get('score')
                                result['typicalScore'] = r.get('typicalScore')
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
