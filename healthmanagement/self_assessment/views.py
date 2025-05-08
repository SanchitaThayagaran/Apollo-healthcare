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
            # Parse AI response for 'Analysis' and 'Recommendations'
            analysis, recommendations = self.parse_analysis_and_recommendations(ai_content)
        except Exception as e:
            return Response({'error': f'OpenAI error: {str(e)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        return Response({
            'analysis': analysis,
            'recommendations': recommendations,
        }, status=status.HTTP_200_OK)

    def build_prompt(self, data):
        personal = data.get('personalInfo', {})
        symptoms = data.get('symptoms', {})
        prompt = (
            "You are a clinical assistant. Given the following patient information, provide:\n"
            "1. A concise clinical impression (do not repeat the full symptom list, just summarize the likely concern) under the heading 'Analysis'.\n"
            "2. Recommendations under the heading 'Recommendations', as a bulleted list. Each recommendation should specify:\n"
            "   - What type of doctor or specialist the patient should consider seeing\n"
            "   - What laboratory or diagnostic tests may be required\n"
            "   - Any immediate actions if symptoms worsen\n\n"
            f"Patient info: Age: {personal.get('age')}, Sex: {personal.get('sex')}, Major complaint: {personal.get('majorComplaint')}\n"
            "Symptoms and details: "
        )
        for k, v in symptoms.items():
            prompt += f"\n- {k}: {v}"
        prompt += (
            "\n\nFormat your response as:\n"
            "Analysis:\n<concise summary>\n"
            "Recommendations:\n"
            "- <recommendation 1>\n"
            "- <recommendation 2>\n"
            "- <recommendation 3>\n"
            "..."
        )
        return prompt

    def parse_analysis_and_recommendations(self, ai_content):
        analysis = ""
        recommendations = []
        lines = ai_content.splitlines()
        in_analysis = False
        in_recommendations = False
        analysis_lines = []
        for line in lines:
            if line.strip().lower().startswith('analysis:'):
                in_analysis = True
                in_recommendations = False
                # If 'Analysis:' is on the same line as content
                content = line.partition(':')[2].strip()
                if content:
                    analysis_lines.append(content)
                continue
            if line.strip().lower().startswith('recommendations:'):
                in_analysis = False
                in_recommendations = True
                continue
            if in_analysis:
                analysis_lines.append(line.strip())
            elif in_recommendations:
                if line.strip().startswith('-'):
                    recommendations.append(line.strip().lstrip('-').strip())
                elif line.strip():
                    # Sometimes the model may not use dashes
                    recommendations.append(line.strip())
        analysis = ' '.join(analysis_lines).strip()
        return analysis, recommendations
