from django.db import models
from django.contrib.auth import get_user_model

User = get_user_model()

class SelfAssessment(models.Model):
    # patient = models.ForeignKey(User, on_delete=models.CASCADE)
    patient = models.ForeignKey(User, on_delete=models.CASCADE, null=True, blank=True)
    submission_date = models.DateTimeField(auto_now_add=True)
    symptom_data = models.JSONField()
    analysis = models.TextField(null=True, blank=True)
    recommendations = models.JSONField(default=list)

# Create your models here.
