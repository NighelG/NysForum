from django.shortcuts import render
from django.shortcuts import get_object_or_404

from rest_framework import generics, status
from rest_framework.permissions import AllowAny, IsAuthenticated, IsAuthenticatedOrReadOnly
from rest_framework.response import Response
from rest_framework.views import APIView
from django.contrib.auth.models import User
from .models import Profile
from .serializers import UserRegistrationSerializer, ProfileSerializer, ProfileUpdateSerializer, ProfileDeleteSerializer, AdminProfileDeleteSerializer

class RegisterView(generics.CreateAPIView):
    serializer_class = UserRegistrationSerializer
    permission_classes = [AllowAny]
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        return Response(
            {'message': 'Usuario registrado exitosamente', 'username': user.username},
            status=status.HTTP_201_CREATED
        )

class ProfileListView(generics.ListAPIView):
    queryset = Profile.objects.select_related('user').all()
    serializer_class = ProfileSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]

class ProfileDetailView(generics.RetrieveUpdateAPIView):
    queryset = Profile.objects.select_related('user').all()
    serializer_class = ProfileSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]
    lookup_field = 'user__username'
    def update(self, request, *args, **kwargs):
        profile = self.get_object()
        if profile.user != request.user:
            return Response(
                {'error': 'No tienes permiso para editar este perfil'},
                status=status.HTTP_403_FORBIDDEN
            )
        return super().update(request, *args, **kwargs)

class ProfileMeView(generics.RetrieveAPIView):
    serializer_class = ProfileSerializer
    permission_classes = [IsAuthenticated]
    def get_object(self):
        return self.request.user.profile

class ProfileDeleteView(APIView):
    permission_classes = [IsAuthenticated]
    def post(self, request, *args, **kwargs):
        serializer = ProfileDeleteSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)    
        user = request.user
        username = user.username
        user.delete()   
        return Response(
            {
                'message': f'Perfil de {username} eliminado exitosamente',
                'deleted_username': username
            },
            status=status.HTTP_200_OK
        )

class AdminProfileDeleteView(APIView):
    permission_classes = [IsAuthenticated]
    def post(self, request, *args, **kwargs):
        if not hasattr(request.user, 'profile'):
            return Response(
                {'error': 'Perfil de usuario no encontrado'},
                status=status.HTTP_400_BAD_REQUEST
            )
        current_profile = request.user.profile
        if current_profile.role not in ['admin', 'true_admin']:
            return Response(
                {'error': 'Se requieren privilegios de administrador'},
                status=status.HTTP_403_FORBIDDEN
            )
        serializer = AdminProfileDeleteSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        username = kwargs.get('user__username')
        profile_to_delete = get_object_or_404(
            Profile.objects.select_related('user'), 
            user__username=username
        )
        if not self.can_delete_profile(current_profile, profile_to_delete):
            return Response(
                {'error': 'No tienes permisos para eliminar este perfil'},
                status=status.HTTP_403_FORBIDDEN
            )
        deleted_username = profile_to_delete.user.username
        deleted_role = profile_to_delete.role
        reason = serializer.validated_data.get('reason', '')
        profile_to_delete.user.delete()
        message = f'Perfil de {deleted_username} ({deleted_role}) eliminado por admin'
        if reason:
            message += f'. Razón: {reason}'
        return Response(
            {
                'message': message,
                'deleted_username': deleted_username,
                'deleted_by': request.user.username,
                'reason': reason if reason else None
            },
            status=status.HTTP_200_OK
        )
    def can_delete_profile(self, current_profile, target_profile):
        current_role = current_profile.role
        target_role = target_profile.role
        if current_role == 'true_admin':
            return True
        if current_role == 'admin':
            return target_role in ['user', 'moderator'] and target_profile.user != current_profile.user
        return False