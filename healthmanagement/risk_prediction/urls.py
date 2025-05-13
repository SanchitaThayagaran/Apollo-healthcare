from django.urls import path
from .views import RiskPredictionView

urlpatterns = [
    path('', RiskPredictionView.as_view(), name='risk-prediction'),
] 