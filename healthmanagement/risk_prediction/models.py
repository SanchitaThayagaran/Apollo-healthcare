from django.db import models
from accounts.models import CustomUser
import uuid

class RiskAssessment(models.Model):
    CONDITION_CHOICES = (
        ('heart', 'Heart Disease'),
        ('diabetes', 'Diabetes'),
    )
    
    # Unique identifier for the assessment
    risk_assessment_id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    
    # User who took the assessment
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name='risk_assessments')
    
    # Assessment type and results
    condition = models.CharField(max_length=20, choices=CONDITION_CHOICES)
    risk_score = models.FloatField()
    heart_age = models.IntegerField(null=True, blank=True)
    typical_score = models.FloatField(null=True, blank=True)
    
    # Store recommendations as a JSON array
    recommendations = models.JSONField(default=list)
    
    # Metadata
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-created_at']
        
    def __str__(self):
        return f"{self.condition} assessment for {self.user.email} - {self.risk_score}%"
