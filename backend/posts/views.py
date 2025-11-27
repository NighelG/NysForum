from django.shortcuts import render
from rest_framework import generics, permissions, status
from rest_framework.exceptions import PermissionDenied
from rest_framework.response import Response
from .models import Post, Category, PostView
from .serializers import (
    PostListSerializer, PostDetailSerializer, PostCreateSerializer, 
    CategorySerializer, PostUpdateSerializer, PostViewSerializer
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

class PostListCreateView(generics.ListCreateAPIView):
    queryset = Post.objects.select_related('profile__user').prefetch_related('categories')
    permission_classes = [permissions.IsAuthenticatedOrReadOnly] 
    def get_queryset(self):
        queryset = super().get_queryset()
        user_id = self.request.query_params.get('user_id')
        if user_id:
            queryset = queryset.filter(profile__user_id=user_id)
        return queryset
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
    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        if request.user.is_authenticated and hasattr(request.user, 'profile'):
            profile = request.user.profile
            viewed, created = PostView.objects.get_or_create(
                post=instance,
                profile=profile
            )
            if created:
                instance.views_count += 1
                instance.save()
        
        serializer = self.get_serializer(instance)
        return Response(serializer.data)
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

class PostIncrementView(generics.CreateAPIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = PostViewSerializer
    def create(self, request, *args, **kwargs):
        try:
            post_id = kwargs.get('pk')
            post = Post.objects.get(id=post_id)
            profile = request.user.profile
            viewed, created = PostView.objects.get_or_create(
                post=post,
                profile=profile
            )
            if created:
                post.views_count += 1
                post.save()
                return Response({
                    'status': 'view counted',
                    'views_count': post.views_count
                }, status=status.HTTP_201_CREATED)
            else:
                return Response({
                    'status': 'already viewed',
                    'views_count': post.views_count
                }, status=status.HTTP_200_OK)
        except Post.DoesNotExist:
            return Response(
                {'error': 'Post not found'}, 
                status=status.HTTP_404_NOT_FOUND
            )