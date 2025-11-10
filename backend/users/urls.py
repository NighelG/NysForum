from django.urls import path
from .views import RegisterView, ProfileListView, ProfileDetailView, ProfileMeView

urlpatterns = [
    path('register/', RegisterView.as_view(), name='register'),
    path('profiles/', ProfileListView.as_view(), name='profile-list'),
    path('profiles/me/', ProfileMeView.as_view(), name='profile-me'),
    path('profiles/<str:user__username>/', ProfileDetailView.as_view(), name='profile-detail'),
]