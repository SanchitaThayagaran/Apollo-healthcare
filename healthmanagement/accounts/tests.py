from django.test import TestCase
from django.urls import reverse
from rest_framework.test import APITestCase, APIClient
from rest_framework import status
import json
from unittest.mock import patch, MagicMock
from datetime import date

from .models import CustomUser, PatientProfile


class CustomUserModelTest(TestCase):
    def test_create_user(self):
        user = CustomUser.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='testpass123'
        )
        self.assertEqual(user.username, 'testuser')
        self.assertEqual(user.email, 'test@example.com')
        self.assertEqual(user.role, 'patient')  # Default role
        self.assertTrue(user.is_active)
        self.assertFalse(user.is_staff)

    def test_create_doctor_user(self):
        user = CustomUser.objects.create_user(
            username='doctoruser',
            email='doctor@example.com',
            password='testpass123',
            role='doctor'
        )
        self.assertEqual(user.role, 'doctor')


class PatientProfileModelTest(TestCase):
    def setUp(self):
        self.user = CustomUser.objects.create_user(
            username='testpatient',
            email='patient@example.com',
            password='testpass123'
        )
        self.profile = PatientProfile.objects.create(
            user=self.user,
            date_of_birth=date(1990, 1, 1),
            gender='M',
            insurance_provider='Test Insurance'
        )

    def test_profile_creation(self):
        self.assertEqual(self.profile.user.username, 'testpatient')
        self.assertEqual(self.profile.date_of_birth, date(1990, 1, 1))
        self.assertEqual(self.profile.gender, 'M')
        self.assertEqual(self.profile.insurance_provider, 'Test Insurance')

    def test_string_representation(self):
        self.assertEqual(str(self.profile), f"Profile for {self.user.email}")


class GoogleLoginViewTest(APITestCase):
    @patch('accounts.views.requests.get')
    def test_successful_login_patient(self, mock_get):
        # Mock response from Google API
        mock_response = MagicMock()
        mock_response.status_code = 200
        mock_response.json.return_value = {
            'email': 'patient@example.com',
            'sub': '12345'
        }
        mock_get.return_value = mock_response

        # Test the endpoint
        url = reverse('google-login')
        data = {'token': 'fake_token'}
        response = self.client.post(url, data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('access', response.data)
        self.assertIn('refresh', response.data)
        self.assertEqual(response.data['role'], 'patient')
        
        # Check that user was created
        self.assertTrue(CustomUser.objects.filter(email='patient@example.com').exists())
        user = CustomUser.objects.get(email='patient@example.com')
        self.assertEqual(user.role, 'patient')
        
        # Check that patient profile was created
        self.assertTrue(PatientProfile.objects.filter(user=user).exists())

    @patch('accounts.views.requests.get')
    def test_successful_login_doctor(self, mock_get):
        # Mock response from Google API
        mock_response = MagicMock()
        mock_response.status_code = 200
        mock_response.json.return_value = {
            'email': 'doctor1@example.com',  # This is in the doctors list
            'sub': '12345'
        }
        mock_get.return_value = mock_response

        # Test the endpoint
        url = reverse('google-login')
        data = {'token': 'fake_token'}
        response = self.client.post(url, data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['role'], 'doctor')
        
        # Check that user was created with doctor role
        user = CustomUser.objects.get(email='doctor1@example.com')
        self.assertEqual(user.role, 'doctor')

    @patch('accounts.views.requests.get')
    def test_invalid_token(self, mock_get):
        # Mock response for invalid token
        mock_response = MagicMock()
        mock_response.status_code = 400
        mock_get.return_value = mock_response

        # Test the endpoint
        url = reverse('google-login')
        data = {'token': 'invalid_token'}
        response = self.client.post(url, data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('error', response.data)

    def test_missing_token(self):
        # Test the endpoint without providing a token
        url = reverse('google-login')
        data = {}  # No token
        response = self.client.post(url, data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('error', response.data)


class PatientProfileViewTest(APITestCase):
    def setUp(self):
        # Create a patient user
        self.patient_user = CustomUser.objects.create_user(
            username='testpatient',
            email='patient@example.com',
            password='testpass123',
            role='patient'
        )
        self.patient_profile = PatientProfile.objects.create(
            user=self.patient_user,
            date_of_birth=date(1990, 1, 1),
            gender='M',
            insurance_provider='Test Insurance'
        )
        
        # Create a doctor user
        self.doctor_user = CustomUser.objects.create_user(
            username='testdoctor',
            email='doctor@example.com',
            password='testpass123',
            role='doctor'
        )
        
        # Create another patient
        self.other_patient = CustomUser.objects.create_user(
            username='otherpatient',
            email='other@example.com',
            password='testpass123',
            role='patient'
        )
        self.other_profile = PatientProfile.objects.create(
            user=self.other_patient,
            date_of_birth=date(1995, 5, 5),
            gender='F',
            insurance_provider='Other Insurance'
        )

    def test_get_own_profile(self):
        # Patient can view their own profile
        self.client.force_authenticate(user=self.patient_user)
        url = reverse('patient-profile', kwargs={'user_id': str(self.patient_user.id)})
        response = self.client.get(url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['user_id'], self.patient_user.id)
        self.assertEqual(response.data['gender'], 'M')
        self.assertEqual(response.data['insurance_provider'], 'Test Insurance')

    def test_doctor_can_view_patient_profile(self):
        # Doctor can view any patient's profile
        self.client.force_authenticate(user=self.doctor_user)
        url = reverse('patient-profile', kwargs={'user_id': str(self.patient_user.id)})
        response = self.client.get(url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['user_id'], self.patient_user.id)

    def test_patient_cannot_view_other_profile(self):
        # Patient cannot view another patient's profile
        self.client.force_authenticate(user=self.patient_user)
        url = reverse('patient-profile', kwargs={'user_id': str(self.other_patient.id)})
        response = self.client.get(url)
        
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        self.assertIn('error', response.data)

    def test_update_own_profile(self):
        # Patient can update their own profile
        self.client.force_authenticate(user=self.patient_user)
        url = reverse('patient-profile', kwargs={'user_id': str(self.patient_user.id)})
        data = {
            'insurance_provider': 'Updated Insurance',
            'gender': 'O'  # Changed gender
        }
        response = self.client.put(url, data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['insurance_provider'], 'Updated Insurance')
        self.assertEqual(response.data['gender'], 'O')
        
        # Verify database was updated
        profile = PatientProfile.objects.get(user=self.patient_user)
        self.assertEqual(profile.insurance_provider, 'Updated Insurance')
        self.assertEqual(profile.gender, 'O')

    def test_patient_cannot_update_other_profile(self):
        # Patient cannot update another patient's profile
        self.client.force_authenticate(user=self.patient_user)
        url = reverse('patient-profile', kwargs={'user_id': str(self.other_patient.id)})
        data = {'insurance_provider': 'Malicious Update'}
        response = self.client.put(url, data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        
        # Verify database was not updated
        profile = PatientProfile.objects.get(user=self.other_patient)
        self.assertEqual(profile.insurance_provider, 'Other Insurance')

    def test_unauthenticated_access(self):
        # Unauthenticated user cannot access the endpoint
        url = reverse('patient-profile', kwargs={'user_id': str(self.patient_user.id)})
        response = self.client.get(url)
        
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
