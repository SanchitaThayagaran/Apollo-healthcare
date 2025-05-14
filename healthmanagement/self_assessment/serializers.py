from rest_framework import serializers
from .models import SelfAssessment

class SelfAssessmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = SelfAssessment
        fields = ['id', 'patient', 'submission_date', 'symptom_data', 'analysis', 'recommendations']
        read_only_fields = ['id', 'patient', 'submission_date', 'analysis', 'recommendations']

    def validate_symptom_data(self, value):
        # Ensure personalInfo and symptoms are present
        personal = value.get('personalInfo')
        symptoms = value.get('symptoms')
        errors = {}
        if not personal:
            errors['personalInfo'] = 'This field is required.'
        else:
            if 'age' not in personal or not isinstance(personal['age'], int):
                errors['age'] = 'Age must be an integer.'
            if 'sex' not in personal or personal['sex'] not in ['Male', 'Female', 'Other']:
                errors['sex'] = 'Sex must be Male, Female, or Other.'
            if 'majorComplaint' not in personal or not personal['majorComplaint']:
                errors['majorComplaint'] = 'Major complaint is required.'
        if not symptoms or not isinstance(symptoms, dict) or not symptoms:
            errors['symptoms'] = 'At least one symptom must be provided.'
        if errors:
            raise serializers.ValidationError(errors)
        return value

    def create(self, validated_data):
        # Pop patient from initial data if present
        patient_id = self.initial_data.get('patient')
        if patient_id:
            from django.contrib.auth import get_user_model
            User = get_user_model()
            try:
                patient = User.objects.get(id=patient_id)
            except User.DoesNotExist:
                patient = None
        else:
            patient = None
        return SelfAssessment.objects.create(
            patient=patient,
            symptom_data=validated_data['symptom_data']
        ) 