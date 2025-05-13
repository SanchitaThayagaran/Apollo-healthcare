from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/accounts/', include('accounts.urls')),  # Include the accounts app URLs
    path('api/risk/', include('risk_prediction.urls')),  # Include the risk_prediction app URLs
    path('appointments/', include('appointments.urls')),
]
