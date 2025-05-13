from django.urls import path
from .views import (
    AppointmentBookingView,
    DoctorListView,         # ← import it
)


urlpatterns = [
    path('book/', AppointmentBookingView.as_view(), name='book-appointment'),
    path("doctors/", DoctorListView.as_view(), name="doctor-list"),
    path("my/",      UserAppointmentsView.as_view(),   name="user-appointments"),
]