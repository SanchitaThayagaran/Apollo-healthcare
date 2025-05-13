from django.test import TestCase
from django.urls import reverse
from rest_framework.test import APIClient, APITestCase
from rest_framework import status
from unittest.mock import patch, MagicMock
from django.contrib.auth import get_user_model
from .models import SelfAssessment
from .serializers import SelfAssessmentSerializer
import json

User = get_user_model()

class SelfAssessmentModelTests(TestCase):
    """Tests for the SelfAssessment model"""
    
    def setUp(self):
        """Set up test data"""
        self.user = User.objects.create(
            username="testuser",
            email="test@example.com",
            role="patient"
        )
        
        self.symptom_data = {
            "personalInfo": {
                "age": 30,
                "sex": "Male",
                "majorComplaint": "headache"
            },
            "symptoms": {
                "headache": {
                    "present": True,
                    "severity": "moderate",
                    "duration": "2 days"
                }
            }
        }
    
    def test_create_self_assessment(self):
        """Test creating a self assessment"""
        assessment = SelfAssessment.objects.create(
            patient=self.user,
            symptom_data=self.symptom_data
        )
        
        # Check that the assessment was created correctly
        self.assertEqual(assessment.patient, self.user)
        self.assertEqual(assessment.symptom_data, self.symptom_data)
        self.assertIsNotNone(assessment.submission_date)
        
        # Check the string representation
        self.assertTrue(str(assessment.id) in str(assessment))
    
    def test_create_self_assessment_without_patient(self):
        """Test creating a self assessment without a patient (anonymous user)"""
        assessment = SelfAssessment.objects.create(
            symptom_data=self.symptom_data
        )
        
        # Check that the assessment was created correctly
        self.assertIsNone(assessment.patient)
        self.assertEqual(assessment.symptom_data, self.symptom_data)
        self.assertIsNotNone(assessment.submission_date)

class SelfAssessmentSerializerTests(TestCase):
    """Tests for the SelfAssessment serializer"""
    
    def setUp(self):
        """Set up test data"""
        self.user = User.objects.create(
            username="testuser",
            email="test@example.com",
            role="patient"
        )
        
        self.symptom_data = {
            "personalInfo": {
                "age": 30,
                "sex": "Male",
                "majorComplaint": "headache"
            },
            "symptoms": {
                "headache": {
                    "present": True,
                    "severity": "moderate",
                    "duration": "2 days"
                }
            }
        }
        
        self.assessment = SelfAssessment.objects.create(
            patient=self.user,
            symptom_data=self.symptom_data
        )
    
    def test_serialize_self_assessment(self):
        """Test serializing a self assessment"""
        serializer = SelfAssessmentSerializer(self.assessment)
        data = serializer.data
        
        # Check that all fields are present
        self.assertIn('id', data)
        self.assertIn('patient', data)
        self.assertIn('submission_date', data)
        self.assertIn('symptom_data', data)
        
        # Check that the data is correct
        self.assertEqual(data['patient'], self.user.id)
        self.assertEqual(data['symptom_data'], self.symptom_data)
    
    def test_deserialize_self_assessment(self):
        """Test deserializing self assessment data"""
        data = {
            'symptom_data': self.symptom_data
        }
        
        serializer = SelfAssessmentSerializer(data=data)
        self.assertTrue(serializer.is_valid())
        
        # Check that read-only fields are not in validated data
        self.assertNotIn('id', serializer.validated_data)
        self.assertNotIn('patient', serializer.validated_data)
        self.assertNotIn('submission_date', serializer.validated_data)

class SelfAssessmentAPITests(APITestCase):
    """Integration tests for the SelfAssessment API"""
    
    def setUp(self):
        """Set up test data and client"""
        self.client = APIClient()
        self.user = User.objects.create(
            username="testuser",
            email="test@example.com",
            role="patient"
        )
        
        self.symptom_data = {
            "personalInfo": {
                "age": 30,
                "sex": "Male",
                "majorComplaint": "headache"
            },
            "symptoms": {
                "headache": {
                    "present": True,
                    "severity": "moderate",
                    "duration": "2 days"
                }
            }
        }
        
        # Mock OpenAI response
        self.mock_ai_response = {
            "choices": [{
                "message": {
                    "content": """Analysis:
Patient presents with moderate headache lasting 2 days. No other significant symptoms reported.

Recommendations:
- Consider consulting a primary care physician or neurologist
- Recommended tests: Blood pressure check, neurological examination
- If symptoms worsen or new symptoms appear, seek immediate medical attention"""
                }
            }]
        }
    
    @patch('openai.OpenAI')
    def test_submit_self_assessment_authenticated(self, mock_openai):
        """Test submitting a self assessment as an authenticated user"""
        # Mock OpenAI client
        mock_client = MagicMock()
        mock_response = MagicMock()
        mock_choice = MagicMock()
        mock_message = MagicMock()
        mock_message.content = self.mock_ai_response["choices"][0]["message"]["content"]
        mock_choice.message = mock_message
        mock_response.choices = [mock_choice]
        mock_client.chat.completions.create.return_value = mock_response
        mock_openai.return_value = mock_client
        # Authenticate user
        self.client.force_authenticate(user=self.user)
        # Submit assessment
        response = self.client.post(
            reverse('self-assessment'),
            data=self.symptom_data,
            format='json'
        )
        print('Authenticated response:', response.data)
        # Check response
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('analysis', response.data)
        self.assertIn('recommendations', response.data)
        # Check that assessment was saved
        self.assertTrue(SelfAssessment.objects.filter(patient=self.user).exists())
    
    @patch('openai.OpenAI')
    def test_submit_self_assessment_unauthenticated(self, mock_openai):
        """Test submitting a self assessment as an unauthenticated user"""
        # Mock OpenAI client
        mock_client = MagicMock()
        mock_response = MagicMock()
        mock_choice = MagicMock()
        mock_message = MagicMock()
        mock_message.content = self.mock_ai_response["choices"][0]["message"]["content"]
        mock_choice.message = mock_message
        mock_response.choices = [mock_choice]
        mock_client.chat.completions.create.return_value = mock_response
        mock_openai.return_value = mock_client
        # Submit assessment without authentication
        response = self.client.post(
            reverse('self-assessment'),
            data=self.symptom_data,
            format='json'
        )
        print('Unauthenticated response:', response.data)
        # Check response
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('analysis', response.data)
        self.assertIn('recommendations', response.data)
        # Check that assessment was saved without patient
        self.assertTrue(SelfAssessment.objects.filter(patient=None).exists())
    
    @patch('openai.OpenAI')
    def test_openai_error_handling(self, mock_openai):
        """Test handling of OpenAI API errors"""
        # Mock OpenAI client to raise an exception
        mock_client = MagicMock()
        mock_client.chat.completions.create.side_effect = Exception("OpenAI API error")
        mock_openai.return_value = mock_client
        
        # Submit assessment
        response = self.client.post(
            reverse('self-assessment'),
            data=self.symptom_data,
            format='json'
        )
        
        # Check error response
        self.assertEqual(response.status_code, status.HTTP_500_INTERNAL_SERVER_ERROR)
        self.assertIn('error', response.data)
        self.assertTrue('OpenAI error' in response.data['error'])
    
    def test_invalid_data_handling(self):
        """Test handling of invalid assessment data"""
        # Submit invalid data
        invalid_data = {
            "personalInfo": {
                "age": "invalid",  # Age should be a number
                "sex": "Invalid"   # Invalid sex value
            },
            "symptoms": {}  # Empty symptoms
        }
        
        response = self.client.post(
            reverse('self-assessment'),
            data=invalid_data,
            format='json'
        )
        print('Invalid data response:', response.data)
        # Check error response
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
