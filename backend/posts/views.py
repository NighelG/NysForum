from django.shortcuts import render
from rest_framework import generics, permissions, status
from rest_framework.exceptions import PermissionDenied
from rest_framework.response import Response
from .models import Post, Category
from .serializers import (
    PostListSerializer, PostDetailSerializer, PostCreateSerializer, 
    CategorySerializer, PostUpdateSerializer
)

class CategoryListCreateView(generics.ListCreateAPIView):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    
class CategoryDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    lookup_field = 'id'

class PostListCreateView(generics.ListCreateAPIView):
    queryset = Post.objects.select_related('profile__user').prefetch_related('categories')
    permission_classes = [permissions.IsAuthenticatedOrReadOnly] 
    
    def get_serializer_class(self):
        if self.request.method == 'POST':
            return PostCreateSerializer
        return PostListSerializer
    
    def get_serializer_context(self):
        context = super().get_serializer_context()
        context['request'] = self.request
        return context 
    
    def perform_create(self, serializer):
        serializer.save(profile=self.request.user.profile)

class PostDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Post.objects.select_related('profile__user').prefetch_related(
        'categories', 'media_files', 'comments'
    )
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def get_serializer_class(self):
        if self.request.method in ['PUT', 'PATCH']:
            return PostUpdateSerializer
        return PostDetailSerializer
    
    def perform_update(self, serializer):
        post = self.get_object()
        if (post.profile != self.request.user.profile and 
            self.request.user.profile.role not in ['admin', 'true_admin']):
            raise permissions.PermissionDenied("No tienes permiso para editar este post")
        serializer.save()
    
    def perform_destroy(self, instance):
        current_profile = self.request.user.profile
        if (instance.profile != current_profile and 
            current_profile.role not in ['admin', 'true_admin']):
            raise PermissionDenied("Solo el autor o un admin puede eliminar este post")
        instance.delete()