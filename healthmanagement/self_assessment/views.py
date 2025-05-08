from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .models import SelfAssessment
from .serializers import SelfAssessmentSerializer
from django.contrib.auth import get_user_model
import openai
import os
from dotenv import load_dotenv

dotenv_path = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), '.env')
load_dotenv(dotenv_path=dotenv_path)
OPENAI_API_KEY = os.getenv('OPENAI_API_KEY')

print("Loaded OpenAI key:", repr(OPENAI_API_KEY))

User = get_user_model()

class SelfAssessmentAPIView(APIView):
    def post(self, request):
        serializer = SelfAssessmentSerializer(data={
            'symptom_data': request.data,
            'patient': request.user.id if request.user.is_authenticated else None
        })
        serializer.is_valid(raise_exception=True)
        assessment = serializer.save()

        # Prepare prompt for OpenAI
        prompt = self.build_prompt(request.data)
        openai_client = openai.OpenAI(api_key=OPENAI_API_KEY)
        try:
            response = openai_client.chat.completions.create(
                model="gpt-3.5-turbo",
                messages=[{"role": "system", "content": "You are a medical assistant."},
                          {"role": "user", "content": prompt}]
            )
            ai_content = response.choices[0].message.content
        except Exception as e:
            return Response({'error': f'OpenAI error: {str(e)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        return Response({
            'analysis': ai_content,
            'recommendations': [],  
            'urgency': None  
        }, status=status.HTTP_200_OK)

    def build_prompt(self, data):
        personal = data.get('personalInfo', {})
        symptoms = data.get('symptoms', {})
        prompt = f"Patient info: Age: {personal.get('age')}, Sex: {personal.get('sex')}, Major complaint: {personal.get('majorComplaint')}\n"
        prompt += "Symptoms and details: "
        for k, v in symptoms.items():
            prompt += f"\n- {k}: {v}"
        prompt += "\nPlease provide a preliminary analysis, urgency level, and recommendations."
        return prompt
