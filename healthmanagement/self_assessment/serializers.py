from rest_framework import serializers
from .models import SelfAssessment

class SelfAssessmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = SelfAssessment
        fields = ['id', 'patient', 'submission_date', 'symptom_data']
        read_only_fields = ['id', 'patient', 'submission_date'] 