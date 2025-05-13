from django.test import TestCase
from django.urls import reverse
from django.utils import timezone
from rest_framework.test import APITestCase, APIClient
from rest_framework import status
import json
from datetime import date, time, timedelta
from unittest.mock import patch, MagicMock

from accounts.models import CustomUser
from .models import Doctor, Appointment
from .serializers import DoctorSerializer, AppointmentSerializer, UserAppointmentSerializer


class DoctorModelTest(TestCase):
    def test_doctor_creation(self):
        doctor = Doctor.objects.create(
            name="Dr. John Smith",
            specialty="Cardiology",
            email="john.smith@example.com"
        )
        self.assertEqual(doctor.name, "Dr. John Smith")
        self.assertEqual(doctor.specialty, "Cardiology")
        self.assertEqual(doctor.email, "john.smith@example.com")
        self.assertEqual(str(doctor), "Dr. John Smith")


class AppointmentModelTest(TestCase):
    def setUp(self):
        # Create a test patient
        self.patient = CustomUser.objects.create_user(
            username="testpatient",
            email="patient@example.com",
            password="testpass123",
            role="patient"
        )
        
        # Create a test doctor
        self.doctor = Doctor.objects.create(
            name="Dr. Jane Doe",
            specialty="General Medicine",
            email="jane.doe@example.com"
        )
        
        # Create a test appointment
        self.appointment = Appointment.objects.create(
            patient=self.patient,
            doctor=self.doctor,
            date=date.today() + timedelta(days=7),
            time=time(14, 30),
            status="Scheduled"
        )
    
    def test_appointment_creation(self):
        self.assertEqual(self.appointment.patient, self.patient)
        self.assertEqual(self.appointment.doctor, self.doctor)
        self.assertEqual(self.appointment.status, "Scheduled")
        
        # Test string representation
        expected_str = f"{self.patient.username} with {self.doctor.name} on {self.appointment.date} at {self.appointment.time}"
        self.assertEqual(str(self.appointment), expected_str)


class DoctorSerializerTest(TestCase):
    def setUp(self):
        self.doctor_data = {
            "name": "Dr. Robert Green",
            "specialty": "Neurology",
            "email": "robert.green@example.com"
        }
        self.doctor = Doctor.objects.create(**self.doctor_data)
        self.serializer = DoctorSerializer(instance=self.doctor)
    
    def test_doctor_serializer_contains_expected_fields(self):
        data = self.serializer.data
        self.assertEqual(set(data.keys()), set(["id", "name", "specialty"]))
    
    def test_doctor_serializer_field_content(self):
        data = self.serializer.data
        self.assertEqual(data["name"], self.doctor_data["name"])
        self.assertEqual(data["specialty"], self.doctor_data["specialty"])


class AppointmentSerializerTest(TestCase):
    def setUp(self):
        # Create test data
        self.patient = CustomUser.objects.create_user(
            username="testpatient2",
            email="patient2@example.com",
            password="testpass123",
            role="patient"
        )
        
        self.doctor = Doctor.objects.create(
            name="Dr. Test Doctor",
            specialty="Testing",
            email="test.doctor@example.com"
        )
        
        self.appointment_data = {
            "patient": self.patient,
            "doctor": self.doctor,
            "date": date.today() + timedelta(days=10),
            "time": time(10, 0),
            "status": "Confirmed"
        }
        
        self.appointment = Appointment.objects.create(**self.appointment_data)
        self.serializer = AppointmentSerializer(instance=self.appointment)
    
    def test_appointment_serializer_contains_expected_fields(self):
        data = self.serializer.data
        self.assertEqual(set(data.keys()), set(["id", "patient", "doctor", "date", "time", "status"]))


class DoctorListViewTest(APITestCase):
    def setUp(self):
        self.doctor1 = Doctor.objects.create(
            name="Dr. First Doctor",
            specialty="Surgery",
            email="first.doctor@example.com"
        )
        
        self.doctor2 = Doctor.objects.create(
            name="Dr. Second Doctor",
            specialty="Pediatrics",
            email="second.doctor@example.com"
        )
        
        self.url = reverse("doctor-list")
    
    def test_get_all_doctors(self):
        response = self.client.get(self.url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 2)
        
        # Verify doctor details
        doctor_names = [doctor["name"] for doctor in response.data]
        self.assertIn(self.doctor1.name, doctor_names)
        self.assertIn(self.doctor2.name, doctor_names)


class UserAppointmentsViewTest(APITestCase):
    def setUp(self):
        # Create a test patient
        self.patient = CustomUser.objects.create_user(
            username="testuser",
            email="testuser@example.com",
            password="testpass123",
            role="patient"
        )
        
        # Create another patient for comparison
        self.other_patient = CustomUser.objects.create_user(
            username="otheruser",
            email="otheruser@example.com",
            password="testpass123",
            role="patient"
        )
        
        # Create a test doctor
        self.doctor = Doctor.objects.create(
            name="Dr. API Test",
            specialty="API Testing",
            email="api.test@example.com"
        )
        
        # Create appointments for both patients
        self.patient_appointment = Appointment.objects.create(
            patient=self.patient,
            doctor=self.doctor,
            date=date.today() + timedelta(days=5),
            time=time(9, 0),
            status="Scheduled"
        )
        
        self.other_appointment = Appointment.objects.create(
            patient=self.other_patient,
            doctor=self.doctor,
            date=date.today() + timedelta(days=6),
            time=time(10, 0),
            status="Scheduled"
        )
        
        self.url = reverse("user-appointments")
    
    def test_get_own_appointments(self):
        # Authenticate as the patient
        self.client.force_authenticate(user=self.patient)
        
        # Get appointments
        response = self.client.get(self.url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)  # Should only see own appointments
        
        # Verify it's the correct appointment
        self.assertEqual(response.data[0]["id"], self.patient_appointment.id)
        self.assertEqual(response.data[0]["doctor_name"], self.doctor.name)
    
    def test_unauthenticated_access(self):
        # Try to access without authentication
        response = self.client.get(self.url)
        
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)


class FilteredAppointmentsViewTest(APITestCase):
    def setUp(self):
        # Create a test patient
        self.patient = CustomUser.objects.create_user(
            username="filterpatient",
            email="filter.patient@example.com",
            password="testpass123",
            role="patient"
        )
        
        # Create a test doctor
        self.doctor = Doctor.objects.create(
            name="Dr. Filter Test",
            specialty="Filtering",
            email="filter.doctor@example.com"
        )
        
        # Create a test appointment
        self.appointment = Appointment.objects.create(
            patient=self.patient,
            doctor=self.doctor,
            date=date.today() + timedelta(days=3),
            time=time(13, 0),
            status="Confirmed"
        )
        
        self.url = reverse("filtered-appointments")
        
        # Create an authenticated user for testing
        self.auth_user = CustomUser.objects.create_user(
            username="authuser",
            email="auth.user@example.com",
            password="testpass123",
            role="doctor"
        )
        self.client.force_authenticate(user=self.auth_user)
    
    def test_filter_by_patient(self):
        # Filter appointments by patient
        response = self.client.get(
            f"{self.url}?email={self.patient.email}&role=patient"
        )
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]["id"], self.appointment.id)
    
    def test_filter_by_doctor(self):
        # Filter appointments by doctor
        response = self.client.get(
            f"{self.url}?email={self.doctor.email}&role=doctor"
        )
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]["id"], self.appointment.id)
    
    def test_invalid_role(self):
        # Test with invalid role
        response = self.client.get(
            f"{self.url}?email={self.patient.email}&role=invalid"
        )
        
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
    
    def test_missing_parameters(self):
        # Test with missing parameters
        response = self.client.get(self.url)
        
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)


class AppointmentBookingViewTest(APITestCase):
    def setUp(self):
        # Create a test patient
        self.patient = CustomUser.objects.create_user(
            username="bookpatient",
            email="book.patient@example.com",
            password="testpass123",
            role="patient"
        )
        
        # Create a test doctor
        self.doctor = Doctor.objects.create(
            name="Dr. Booking Test",
            specialty="Booking",
            email="booking.doctor@example.com"
        )
        
        self.appointment_data = {
            "patient": self.patient.id,
            "doctor": self.doctor.id,
            "date": (date.today() + timedelta(days=7)).isoformat(),
            "time": "14:00:00",
            "status": "Scheduled"
        }
        
        self.url = reverse("book-appointment")
        
        # Authenticate the client
        self.client.force_authenticate(user=self.patient)
    
    @patch('appointments.views.send_appointment_reminder')
    def test_book_appointment(self, mock_send_reminder):
        # Mock the notification function to avoid actual AWS calls
        mock_send_reminder.return_value = None
        
        # Book an appointment
        response = self.client.post(
            self.url,
            data=json.dumps(self.appointment_data),
            content_type='application/json'
        )
        
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data["message"], "Appointment booked successfully")
        
        # Verify appointment was created
        self.assertEqual(Appointment.objects.count(), 1)
        appointment = Appointment.objects.first()
        self.assertEqual(appointment.patient, self.patient)
        self.assertEqual(appointment.doctor, self.doctor)
        
        # Verify notification was attempted
        mock_send_reminder.assert_called_once()
    
    def test_invalid_appointment_data(self):
        # Remove required field
        invalid_data = self.appointment_data.copy()
        del invalid_data["doctor"]
        
        response = self.client.post(
            self.url,
            data=json.dumps(invalid_data),
            content_type='application/json'
        )
        
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        
        # Verify no appointment was created
        self.assertEqual(Appointment.objects.count(), 0)
