from django.urls import path
from .views import (
    AppointmentBookingView,
    DoctorListView,         # ← import it
    UserAppointmentsView,
    FilteredAppointmentsView
)


urlpatterns = [
    path('book/', AppointmentBookingView.as_view(), name='book-appointment'),
    path("doctors/", DoctorListView.as_view(), name="doctor-list"),
    path("my/",      UserAppointmentsView.as_view(),   name="user-appointments"),
    path('filtered/', FilteredAppointmentsView.as_view(), name='filtered-appointments'),
]