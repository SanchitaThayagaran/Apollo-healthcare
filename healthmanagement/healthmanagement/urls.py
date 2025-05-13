from django.contrib import admin
from django.urls import path, include
from accounts.views import RiskPredictionView
from self_assessment.views import SelfAssessmentAPIView

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/accounts/', include('accounts.urls')),  # Include the accounts app URLs
    path('api/risk/', RiskPredictionView.as_view(), name='risk-prediction'),
    path('api/self-assessment/', SelfAssessmentAPIView.as_view(), name='self-assessment'),
    path('appointments/', include('appointments.urls')),
]
