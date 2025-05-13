from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .serializers import AppointmentSerializer
from .notifications import send_appointment_reminder
from rest_framework import generics
from .models import Doctor
from .serializers import DoctorSerializer
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


class AppointmentBookingView(APIView):
    def post(self, request):
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
