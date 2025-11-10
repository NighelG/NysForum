from django.shortcuts import render
from rest_framework import generics, permissions
from .models import Comment
from .serializers import CommentSerializer

class CommentListCreateView(generics.ListCreateAPIView):
    queryset = Comment.objects.all()
    serializer_class = CommentSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    def perform_create(self, serializer):
        serializer.save(profile=self.request.user.profile)

class CommentDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Comment.objects.all()
    serializer_class = CommentSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    def perform_update(self, serializer):
        comment = self.get_object()
        if comment.profile != self.request.user.profile:
            raise permissions.PermissionDenied("No tienes permiso para editar este comentario")
        serializer.save()
    def perform_destroy(self, instance):
        if instance.profile != self.request.user.profile and not self.request.user.is_staff:
            raise permissions.PermissionDenied("Solo el autor o un admin puede eliminar este comentario")
        instance.delete()
