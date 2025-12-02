from django.urls import path
from .views import (
    RegisterView,
    ProfileListView,
    ProfileDetailView,
    ProfileMeView,
    ProfileDeleteView,
    AdminProfileDeleteView,
    ProfileAvatarUpdateView,
    ProfileAvatarGetView,
    UserDeleteView,
    TestMongoDBView,
    
    
)

urlpatterns = [
    # Registro y autenticación
    path('register/', RegisterView.as_view(), name='register'),
    # Perfiles
    path('profiles/', ProfileListView.as_view(), name='profile-list'),
    path('profiles/me/', ProfileMeView.as_view(), name='profile-me'),
    path('profiles/<str:username>/', ProfileDetailView.as_view(), name='profile-detail'),
    # Eliminación de perfiles
    path('profiles/me/delete/', ProfileDeleteView.as_view(), name='profile-delete-me'),
    path('profiles/<str:username>/admin-delete/', AdminProfileDeleteView.as_view(), name='profile-admin-delete'),
    path('userdelete/', UserDeleteView.as_view(), name='user-delete'),
    # Avatares
    path('profiles/me/avatar/', ProfileAvatarUpdateView.as_view(), name='profile-avatar-update'),
    path('profiles/<str:username>/avatar/', ProfileAvatarGetView.as_view(), name='profile-avatar-get'),
    path('test-mongodb/', TestMongoDBView.as_view(), name='test-mongodb')
]