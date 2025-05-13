from rest_framework import serializers
from .models import Appointment
from .models import Doctor

class DoctorSerializer(serializers.ModelSerializer):
    class Meta:
        model = Doctor
        fields = ["id", "name", "specialty"]


class AppointmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Appointment
        fields = ['id','patient','doctor','date','time','status']

class UserAppointmentSerializer(serializers.ModelSerializer):
    doctor_name = serializers.CharField(source="doctor.name", read_only=True)
    class Meta:
        model = Appointment
        fields = ["id", "doctor_name", "date", "time", "status"]