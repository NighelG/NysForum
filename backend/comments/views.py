from django.shortcuts import render
from rest_framework import generics, permissions, status
from rest_framework.response import Response
from django.db.models import Prefetch
from .models import Comment
from .serializers import CommentSerializer

class CommentListCreateView(generics.ListCreateAPIView):
    serializer_class = CommentSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly] 
    def get_queryset(self):
        queryset = Comment.objects.select_related(
            'profile__user', 'post'
        ).prefetch_related(
            'media_files',
            Prefetch('replies', queryset=Comment.objects.select_related('profile__user').prefetch_related('media_files'))
        ).filter(parent__isnull=True)
        
        return queryset
    def get_serializer_context(self):
        context = super().get_serializer_context()
        context['request'] = self.request
        return context
    def perform_create(self, serializer):
        serializer.save(profile=self.request.user.profile)

class CommentDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Comment.objects.select_related('profile__user', 'post').prefetch_related(
        'media_files', 'replies'
    )
    serializer_class = CommentSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    def perform_update(self, serializer):
        comment = self.get_object()
        if (comment.profile != self.request.user.profile and 
            self.request.user.profile.role not in ['admin', 'true_admin']):
            raise permissions.PermissionDenied("No tienes permiso para editar este comentario")
        serializer.save()
    def perform_destroy(self, instance):
        current_profile = self.request.user.profile
        if (instance.profile != current_profile and 
            current_profile.role not in ['admin', 'true_admin']):
            raise permissions.PermissionDenied("Solo el autor o un admin puede eliminar este comentario")
        instance.delete()

class CommentListCreateView(generics.ListCreateAPIView):
    serializer_class = CommentSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly] 
    
    def get_queryset(self):
        queryset = Comment.objects.select_related(
            'profile__user', 'post'
        ).prefetch_related(
            'media_files',
            Prefetch('replies', queryset=Comment.objects.select_related('profile__user').prefetch_related('media_files'))
        ).filter(parent__isnull=True)
        # Filtro por user_id
        user_id = self.request.query_params.get('user_id')
        if user_id:
            queryset = queryset.filter(profile__user_id=user_id)
        
        return queryset
    
    def get_serializer_context(self):
        context = super().get_serializer_context()
        context['request'] = self.request
        return context
    
    def perform_create(self, serializer):
        serializer.save(profile=self.request.user.profile)