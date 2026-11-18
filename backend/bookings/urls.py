from django.urls import path
from . import views

urlpatterns = [
    path('', views.BookingCreateView.as_view(), name='booking-create'),
    path('my/', views.BookingListView.as_view(), name='booking-list'),
    path('admin/all/', views.AdminBookingListView.as_view(), name='admin-booking-list'),
    path('<int:pk>/', views.BookingDetailView.as_view(), name='booking-detail'),
    path('<int:pk>/pay/', views.simulate_payment, name='booking-pay'),
]
