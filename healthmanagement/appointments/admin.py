from django.contrib import admin
from .models import Doctor, Appointment

@admin.register(Doctor)
class DoctorAdmin(admin.ModelAdmin):
    list_display = ("id", "name", "specialty")
    search_fields = ("name", "specialty")

@admin.register(Appointment)
class AppointmentAdmin(admin.ModelAdmin):
    list_display = ("id", "patient", "doctor", "date", "time", "status")
    list_filter  = ("status", "date")
    search_fields = ("patient__username", "doctor__name")
