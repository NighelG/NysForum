from django.urls import path
from .views import RegisterView, ProfileListView, ProfileDetailView, ProfileMeView, ProfileDeleteView, AdminProfileDeleteView,UserDeleteView

urlpatterns = [
    path('register/', RegisterView.as_view(), name='register'),
    path('profiles/', ProfileListView.as_view(), name='profile-list'),
    path('profiles/me/', ProfileMeView.as_view(), name='profile-me'),
    path('profiles/<str:user__username>/', ProfileDetailView.as_view(), name='profile-detail'),
    path('profiles/me/delete/', ProfileDeleteView.as_view(), name='profile-delete-me'),
    path('profiles/<str:user__username>/delete/', AdminProfileDeleteView.as_view(), name='profile-delete-admin'),
    path('userdelete/', UserDeleteView.as_view(), name='user-delete'),
]