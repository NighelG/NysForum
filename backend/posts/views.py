from django.shortcuts import render

from rest_framework import generics, permissions
from .models import Post, Category
from .serializers import (
    PostListSerializer, PostDetailSerializer, PostCreateSerializer, CategorySerializer
)

class CategoryListCreateView(generics.ListCreateAPIView):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

class CategoryDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    lookup_field = 'slug'

class PostListCreateView(generics.ListCreateAPIView):
    queryset = Post.objects.all()
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    def get_serializer_class(self):
        if self.request.method == 'POST':
            return PostCreateSerializer
        return PostListSerializer
    def perform_create(self, serializer):
        serializer.save(profile=self.request.user.profile)

class PostDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Post.objects.all()
    serializer_class = PostDetailSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    def perform_update(self, serializer):
        post = self.get_object()
        if post.profile != self.request.user.profile:
            raise permissions.PermissionDenied("No tienes permiso para editar este post")
        serializer.save()
    def perform_destroy(self, instance):
        if instance.profile != self.request.user.profile and not self.request.user.is_staff:
            raise permissions.PermissionDenied("Solo el autor o un admin puede eliminar este post")
        instance.delete()
