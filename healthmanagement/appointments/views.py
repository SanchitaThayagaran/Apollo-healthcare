from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .serializers import AppointmentSerializer
from .notifications import send_appointment_reminder
from rest_framework import generics
from .models import Doctor
from .serializers import DoctorSerializer
from accounts.models import CustomUser
from rest_framework.permissions import IsAuthenticated

from .models import Appointment
from .serializers import UserAppointmentSerializer

class UserAppointmentsView(generics.ListAPIView):
    serializer_class = UserAppointmentSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Appointment.objects.filter(patient=self.request.user)

class DoctorListView(generics.ListAPIView):
    queryset = Doctor.objects.all()
    serializer_class = DoctorSerializer

class FilteredAppointmentsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        email = request.query_params.get('email')
        role = request.query_params.get('role')
        return self._filter_appointments(email, role)

    def post(self, request):
        email = request.data.get('email')
        role = request.data.get('role')
        return self._filter_appointments(email, role)

    def _filter_appointments(self, email, role):
        if not email or not role:
            return Response({'detail': 'Email and role are required.'}, status=status.HTTP_400_BAD_REQUEST)

        if role == 'doctor':
            doctor = Doctor.objects.filter(email=email).first()
            if not doctor:
                return Response({'detail': 'Doctor not found.'}, status=status.HTTP_404_NOT_FOUND)
            appointments = Appointment.objects.filter(doctor_id=doctor.id)

        elif role == 'patient':
            patient = CustomUser.objects.filter(email=email, role='patient').first()
            print(patient.id)
            if not patient:
                return Response({'detail': 'Patient not found.'}, status=status.HTTP_404_NOT_FOUND)
            appointments = Appointment.objects.filter(patient_id=patient.id)

        else:
            return Response({'detail': 'Invalid role provided.'}, status=status.HTTP_400_BAD_REQUEST)

        serializer = UserAppointmentSerializer(appointments, many=True)
        print(serializer.data)
        return Response(serializer.data, status=status.HTTP_200_OK)

class AppointmentBookingView(APIView):
    def post(self, request):
        print(request.data)
        serializer = AppointmentSerializer(data=request.data)
        if serializer.is_valid():
            appt = serializer.save()

            # Build notification message
            patient = appt.patient
            doctor  = appt.doctor
            msg = (
                f"Hi {patient.username},\n"
                f"Your appointment with Dr. {doctor.name} is confirmed for "
                f"{appt.date} at {appt.time}.\n\n"
                "Thank you for choosing Apollo Healthcare!"
            )

            # Send reminder via AWS SNS
            send_appointment_reminder(patient.email, msg)

            return Response(
                {'message': 'Appointment booked successfully'},
                status=status.HTTP_201_CREATED
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
