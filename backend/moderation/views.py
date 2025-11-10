from django.shortcuts import render
from rest_framework import generics, permissions
from rest_framework.exceptions import PermissionDenied
from .models import ModerationActionPost, ModerationActionComment
from .serializers import ModerationActionPostSerializer, ModerationActionCommentSerializer

class IsModeratorOrAdmin(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated and (
            request.user.is_staff or request.user.is_superuser
        )

class ModerationActionPostListCreateView(generics.ListCreateAPIView):
    queryset = ModerationActionPost.objects.all()
    serializer_class = ModerationActionPostSerializer
    def get_permissions(self):
        if self.request.method == 'GET':
            return [IsModeratorOrAdmin()]
        return [permissions.IsAuthenticated()]
    def perform_create(self, serializer):
        serializer.save(reported_by=self.request.user.profile)

class ModerationActionPostDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = ModerationActionPost.objects.all()
    serializer_class = ModerationActionPostSerializer
    permission_classes = [IsModeratorOrAdmin]
    def perform_update(self, serializer):
        if not (self.request.user.is_staff or self.request.user.is_superuser):
            raise PermissionDenied("No tienes permiso para editar este reporte.")
        serializer.save()
    def perform_destroy(self, instance):
        if not (self.request.user.is_staff or self.request.user.is_superuser):
            raise PermissionDenied("Solo un moderador o admin puede eliminar reportes.")
        instance.delete()

class ModerationActionCommentListCreateView(generics.ListCreateAPIView):
    queryset = ModerationActionComment.objects.all()
    serializer_class = ModerationActionCommentSerializer
    def get_permissions(self):
        if self.request.method == 'GET':
            return [IsModeratorOrAdmin()]
        return [permissions.IsAuthenticated()]
    def perform_create(self, serializer):
        serializer.save(reported_by=self.request.user.profile)

class ModerationActionCommentDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = ModerationActionComment.objects.all()
    serializer_class = ModerationActionCommentSerializer
    permission_classes = [IsModeratorOrAdmin]
    def perform_update(self, serializer):
        if not (self.request.user.is_staff or self.request.user.is_superuser):
            raise PermissionDenied("No tienes permiso para editar este reporte.")
        serializer.save()
    def perform_destroy(self, instance):
        if not (self.request.user.is_staff or self.request.user.is_superuser):
            raise PermissionDenied("Solo un moderador o admin puede eliminar reportes.")
        instance.delete()