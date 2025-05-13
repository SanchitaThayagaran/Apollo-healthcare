import requests
from django.conf import settings
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from .models import CustomUser, PatientProfile
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404
from rest_framework.decorators import permission_classes

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
        doctor_emails = ['doctor1@example.com', 'doctor2@example.com','vaishnavikashyap1804@gmail.com']  # Update with your actual doctor emails or logic
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
        print(user.id)

        # Create PatientProfile if user is a patient and doesn't have a profile yet
        if user.role == 'patient':
            PatientProfile.objects.get_or_create(user=user)

        print(user.id, user.email, user.role)

        # Step 6: Issue JWT tokens for the user
        refresh = RefreshToken.for_user(user)
        access_token = str(refresh.access_token)
        refresh_token = str(refresh)

        # Step 7: Return the tokens and role in the response
        return Response({
            'access': access_token,
            'refresh': refresh_token,
            'role': user.role,
            'user_id': user.id,
            'email' :user.email
        }, status=status.HTTP_200_OK)


class PatientProfileView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request, user_id):
        # Check permissions - users can only view their own profile or doctors can view any
        if str(request.user.id) != user_id and request.user.role != 'doctor':
            return Response({"error": "You don't have permission to view this profile."}, 
                            status=status.HTTP_403_FORBIDDEN)
            
        # Get the profile or return 404
        profile = get_object_or_404(PatientProfile, user_id=user_id)
        
        # Return the profile data
        data = {
            'user_id': profile.user_id,
            'date_of_birth': profile.date_of_birth,
            'gender': profile.gender,
            'insurance_provider': profile.insurance_provider
        }
        
        return Response(data, status=status.HTTP_200_OK)
    
    def put(self, request, user_id):
        # Check permissions - users can only update their own profile
        if str(request.user.id) != user_id:
            return Response({"error": "You don't have permission to update this profile."}, 
                            status=status.HTTP_403_FORBIDDEN)
            
        # Get the profile
        profile = get_object_or_404(PatientProfile, user_id=user_id)
        
        # Update the profile with the request data
        if 'date_of_birth' in request.data:
            profile.date_of_birth = request.data.get('date_of_birth')
        if 'gender' in request.data:
            profile.gender = request.data.get('gender')
        if 'insurance_provider' in request.data:
            profile.insurance_provider = request.data.get('insurance_provider')
            
        # Save the changes
        profile.save()
        
        # Return the updated profile
        data = {
            'user_id': profile.user_id,
            'date_of_birth': profile.date_of_birth,
            'gender': profile.gender,
            'insurance_provider': profile.insurance_provider
        }
        
        return Response(data, status=status.HTTP_200_OK)
