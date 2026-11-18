from django.urls import path
from . import views

urlpatterns = [
    path('', views.MuseumListView.as_view(), name='museum-list'),
    path('my/', views.OperatorMuseumListView.as_view(), name='operator-museum-list'),
    path('<int:pk>/', views.MuseumDetailView.as_view(), name='museum-detail'),
]
