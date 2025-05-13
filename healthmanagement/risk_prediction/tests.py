from django.test import TestCase
from django.urls import reverse
from rest_framework.test import APIClient
from rest_framework import status
from unittest.mock import patch, MagicMock
from accounts.models import CustomUser
from .models import RiskAssessment
import json
import uuid

class RiskPredictionTests(TestCase):
    """Tests for the risk prediction API"""

    def setUp(self):
        """Set up test data and clients"""
        # Create test user
        self.user = CustomUser.objects.create(
            username="testuser",
            email="test@example.com",
            role="patient"
        )
        
        # Set up API client
        self.client = APIClient()
        
        # Mock API response data for heart risk
        self.mock_heart_response_data = {
            'engineResults': [{
                'results': [
                    {
                        'id': 'Qrisk3',
                        'score': 5.6,
                        'typicalScore': 3.2,
                        'message': 'Test message'
                    },
                    {
                        'id': 'Qrisk3HeartAge',
                        'score': 45,
                    }
                ],
                'calculationMeta': {
                    'engineResultStatus': 'CALCULATED_USING_ESTIMATED_OR_CORRECTED_DATA',
                    'engineResultStatusReason': None
                }
            }]
        }
        
        # Mock API response data for diabetes risk
        self.mock_diabetes_response_data = {
            'engineResults': [{
                'results': [
                    {
                        'id': 'QDiabetes',
                        'score': 8.3,
                        'typicalScore': 4.1,
                        'message': 'Test diabetes message'
                    }
                ],
                'calculationMeta': {
                    'engineResultStatus': 'CALCULATED_USING_ESTIMATED_OR_CORRECTED_DATA',
                    'engineResultStatusReason': None
                }
            }]
        }
        
        # Sample request payload for heart risk
        self.heart_payload = {
            'requestedEngines': ['QRisk3'],
            'user_id': str(self.user.id),
            'sex': 'Male',
            'age': 50,
            'bmi': 28.5,
            'smokingStatus': 'NonSmoker'
        }
        
        # Sample request payload for diabetes risk
        self.diabetes_payload = {
            'requestedEngines': ['QDiabetes'],
            'user_id': str(self.user.id),
            'sex': 'Female',
            'age': 45,
            'bmi': 29.1,
            'smokingStatus': 'ExSmoker'
        }

    @patch('requests.post')
    def test_heart_risk_prediction(self, mock_post):
        """Test heart risk prediction API endpoint"""
        # Mock the external API response
        mock_response = MagicMock()
        mock_response.status_code = 200
        mock_response.json.return_value = self.mock_heart_response_data
        mock_post.return_value = mock_response
        
        # Make the API request
        response = self.client.post(
            reverse('risk-prediction'),
            data=json.dumps(self.heart_payload),
            content_type='application/json'
        )
        
        # Check response status and data
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['riskScore'], 5.6)
        self.assertEqual(response.data['heartAge'], 45)
        self.assertEqual(response.data['typicalScore'], 3.2)
        
        # Verify that recommendations are provided
        self.assertTrue(len(response.data['recommendations']) > 0)
        
        # Verify that a risk assessment was saved to database
        self.assertTrue(RiskAssessment.objects.filter(user=self.user, condition='heart').exists())

    @patch('requests.post')
    def test_diabetes_risk_prediction(self, mock_post):
        """Test diabetes risk prediction API endpoint"""
        # Mock the external API response
        mock_response = MagicMock()
        mock_response.status_code = 200
        mock_response.json.return_value = self.mock_diabetes_response_data
        mock_post.return_value = mock_response
        
        # Make the API request
        response = self.client.post(
            reverse('risk-prediction'),
            data=json.dumps(self.diabetes_payload),
            content_type='application/json'
        )
        
        # Check response status and data
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['riskScore'], 8.3)
        self.assertEqual(response.data['typicalScore'], 4.1)
        
        # Verify that recommendations are provided
        self.assertTrue(len(response.data['recommendations']) > 0)
        
        # Verify that a risk assessment was saved to database
        self.assertTrue(RiskAssessment.objects.filter(user=self.user, condition='diabetes').exists())

    @patch('requests.post')
    def test_external_api_error(self, mock_post):
        """Test handling of external API errors"""
        # Mock an error response from external API
        mock_response = MagicMock()
        mock_response.status_code = 500
        mock_response.text = "Internal Server Error"
        mock_post.return_value = mock_response
        
        # Make the API request
        response = self.client.post(
            reverse('risk-prediction'),
            data=json.dumps(self.heart_payload),
            content_type='application/json'
        )
        
        # Check response status and error details
        self.assertEqual(response.status_code, status.HTTP_502_BAD_GATEWAY)
        self.assertEqual(response.data['error'], 'External API error')
        self.assertEqual(response.data['status_code'], 500)

    @patch('requests.post')
    def test_invalid_user_id(self, mock_post):
        """Test behavior with invalid user ID"""
        # Mock the external API response
        mock_response = MagicMock()
        mock_response.status_code = 200
        mock_response.json.return_value = self.mock_heart_response_data
        mock_post.return_value = mock_response
        
        # Create payload with invalid user ID
        invalid_payload = self.heart_payload.copy()
        invalid_payload['user_id'] = str(uuid.uuid4())  # Random UUID that doesn't exist
        
        # Make the API request
        response = self.client.post(
            reverse('risk-prediction'),
            data=json.dumps(invalid_payload),
            content_type='application/json'
        )
        
        # Should still return 200 but not create a risk assessment
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['riskScore'], 5.6)
        
        # Check that no risk assessment was saved
        self.assertEqual(RiskAssessment.objects.count(), 0)

    def test_get_recommendations(self):
        """Test the recommendation generation function"""
        from .views import get_recommendations
        
        # Test heart recommendations at different risk levels
        low_heart_recs = get_recommendations('heart', 5.0)
        medium_heart_recs = get_recommendations('heart', 15.0)
        high_heart_recs = get_recommendations('heart', 25.0)
        
        # Ensure recommendations are returned for each risk level
        self.assertTrue(len(low_heart_recs) > 0)
        self.assertTrue(len(medium_heart_recs) > 0)
        self.assertTrue(len(high_heart_recs) > 0)
        
        # High risk should have more recommendations than low risk
        self.assertTrue(len(high_heart_recs) > len(low_heart_recs))
        
        # Test diabetes recommendations at different risk levels
        low_diabetes_recs = get_recommendations('diabetes', 5.0)
        medium_diabetes_recs = get_recommendations('diabetes', 15.0)
        high_diabetes_recs = get_recommendations('diabetes', 25.0)
        
        # Ensure recommendations are returned for each risk level
        self.assertTrue(len(low_diabetes_recs) > 0)
        self.assertTrue(len(medium_diabetes_recs) > 0)
        self.assertTrue(len(high_diabetes_recs) > 0)
        
        # High risk should have more recommendations than low risk
        self.assertTrue(len(high_diabetes_recs) > len(low_diabetes_recs))

class RiskAssessmentModelTests(TestCase):
    """Tests for the RiskAssessment model"""
    
    def setUp(self):
        """Set up test data"""
        self.user = CustomUser.objects.create(
            username="testuser",
            email="test@example.com",
            role="patient"
        )
    
    def test_create_heart_risk_assessment(self):
        """Test creating a heart risk assessment"""
        assessment = RiskAssessment.objects.create(
            user=self.user,
            condition='heart',
            risk_score=12.5,
            heart_age=55,
            typical_score=8.2,
            recommendations=["Recommendation 1", "Recommendation 2"]
        )
        
        # Check that the assessment was created correctly
        self.assertEqual(assessment.user, self.user)
        self.assertEqual(assessment.condition, 'heart')
        self.assertEqual(assessment.risk_score, 12.5)
        self.assertEqual(assessment.heart_age, 55)
        self.assertEqual(assessment.typical_score, 8.2)
        self.assertEqual(len(assessment.recommendations), 2)
        
        # Check the string representation
        self.assertTrue(f"{self.user.email}" in str(assessment))
        self.assertTrue("12.5%" in str(assessment))
    
    def test_create_diabetes_risk_assessment(self):
        """Test creating a diabetes risk assessment"""
        assessment = RiskAssessment.objects.create(
            user=self.user,
            condition='diabetes',
            risk_score=9.3,
            typical_score=5.1,
            recommendations=["Recommendation 1", "Recommendation 2", "Recommendation 3"]
        )
        
        # Check that the assessment was created correctly
        self.assertEqual(assessment.user, self.user)
        self.assertEqual(assessment.condition, 'diabetes')
        self.assertEqual(assessment.risk_score, 9.3)
        self.assertEqual(assessment.heart_age, None)  # No heart age for diabetes
        self.assertEqual(assessment.typical_score, 5.1)
        self.assertEqual(len(assessment.recommendations), 3)
