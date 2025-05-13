from django.db import models
from accounts.models import CustomUser

class Doctor(models.Model):
    # Simple doctor record; you can expand later
    name = models.CharField(max_length=100)
    specialty = models.CharField(max_length=100)
    email = models.EmailField() 

    def __str__(self):
        return self.name

class Appointment(models.Model):
    patient = models.ForeignKey(
        CustomUser,
        limit_choices_to={'role': 'patient'},
        on_delete=models.CASCADE
    )
    doctor = models.ForeignKey(Doctor, on_delete=models.CASCADE)
    date = models.DateField()
    time = models.TimeField()
    status = models.CharField(
        max_length=20,
        choices=[('Scheduled','Scheduled'),('Confirmed','Confirmed'),('Cancelled','Cancelled')],
        default='Scheduled'
    )

    def __str__(self):
        return f"{self.patient.username} with {self.doctor.name} on {self.date} at {self.time}"
