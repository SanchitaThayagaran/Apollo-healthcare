import requests
from django.conf import settings
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from .models import CustomUser
from rest_framework_simplejwt.tokens import RefreshToken

class GoogleLoginView(APIView):
    def post(self, request):
        # Step 1: Extract token from the request
        token = request.data.get('token')
        if not token:
            return Response({"error": "Token is required."}, status=status.HTTP_400_BAD_REQUEST)

        # Step 2: Verify token with Google API
        response = requests.get(f'https://www.googleapis.com/oauth2/v3/tokeninfo?id_token={token}')
        if response.status_code != 200:
            return Response({"error": "Invalid token."}, status=status.HTTP_400_BAD_REQUEST)

        # Step 3: Extract user information from the response
        user_info = response.json()
        email = user_info.get('email')

        # Check if email exists
        if not email:
            return Response({"error": "Email not found in token."}, status=status.HTTP_400_BAD_REQUEST)

        # Step 4: Check role based on email domain or static list
        # For now, we assume doctors are from a predefined list of emails or domain
        doctor_emails = ['doctor1@example.com', 'doctor2@example.com']  # Update with your actual doctor emails or logic
        role = 'doctor' if email in doctor_emails else 'patient'

        # Step 5: Get or create user in the database
        user, created = CustomUser.objects.get_or_create(
            email=email,
            defaults={'username': email, 'role': role},
        )

        # If the user already exists and role is not set, update the role
        if not created and user.role != role:
            user.role = role
            user.save()

        # Step 6: Issue JWT tokens for the user
        refresh = RefreshToken.for_user(user)
        access_token = str(refresh.access_token)
        refresh_token = str(refresh)

        # Step 7: Return the tokens and role in the response
        return Response({
            'access': access_token,
            'refresh': refresh_token,
            'role': user.role
        }, status=status.HTTP_200_OK)
