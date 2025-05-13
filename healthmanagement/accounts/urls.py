from django.urls import path
from .views import GoogleLoginView, PatientProfileView

urlpatterns = [
    path('google-login/', GoogleLoginView.as_view(), name='google-login'),
    path('patient-profile/<str:user_id>/', PatientProfileView.as_view(), name='patient-profile'),
]
