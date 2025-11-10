from django.shortcuts import render
from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from django.db.models import Q
from .models import (
    ReactionPost, ReactionComment, Notification,
    ReportPost, ReportComment,
    ModerationActionPost, ModerationActionComment
)
from .serializers import (
    ReactionPostSerializer, ReactionCommentSerializer, NotificationSerializer,
    ReportPostSerializer, ReportCommentSerializer,
    ModerationActionPostSerializer, ModerationActionCommentSerializer
)

class IsModeratorOrAdmin(permissions.BasePermission):
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        if hasattr(request.user, 'profile'):
            return request.user.profile.role in ['moderator', 'admin', 'true_admin']
        return False

class IsAdminOrTrueAdmin(permissions.BasePermission):
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        if hasattr(request.user, 'profile'):
            return request.user.profile.role in ['admin', 'true_admin']
        return False

class ReactionPostListCreateView(generics.ListCreateAPIView):
    queryset = ReactionPost.objects.select_related('profile__user', 'post')
    serializer_class = ReactionPostSerializer
    permission_classes = [permissions.IsAuthenticated]
    def perform_create(self, serializer):
        serializer.save(profile=self.request.user.profile)

class ReactionCommentListCreateView(generics.ListCreateAPIView):
    queryset = ReactionComment.objects.select_related('profile__user', 'comment')
    serializer_class = ReactionCommentSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def perform_create(self, serializer):
        serializer.save(profile=self.request.user.profile)

class NotificationListView(generics.ListAPIView):
    serializer_class = NotificationSerializer
    permission_classes = [permissions.IsAuthenticated]
    def get_queryset(self):
        return Notification.objects.filter(recipient=self.request.user.profile)

class NotificationMarkAsReadView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    def post(self, request, pk=None):
        if pk:
            notification = Notification.objects.filter(
                pk=pk, 
                recipient=request.user.profile
            ).first()
            if notification:
                notification.is_read = True
                notification.save()
                return Response({'message': 'Notificación marcada como leída'})
            return Response({'error': 'Notificación no encontrada'}, status=404)
        else:
            Notification.objects.filter(
                recipient=request.user.profile, 
                is_read=False
            ).update(is_read=True)
            return Response({'message': 'Todas las notificaciones marcadas como leídas'})

class ReportPostCreateView(generics.CreateAPIView):
    queryset = ReportPost.objects.all()
    serializer_class = ReportPostSerializer
    permission_classes = [permissions.IsAuthenticated]
    def perform_create(self, serializer):
        serializer.save(reporter=self.request.user.profile)

class ReportCommentCreateView(generics.CreateAPIView):
    queryset = ReportComment.objects.all()
    serializer_class = ReportCommentSerializer
    permission_classes = [permissions.IsAuthenticated]
    def perform_create(self, serializer):
        serializer.save(reporter=self.request.user.profile)

class ModerationActionPostListCreateView(generics.ListCreateAPIView):
    serializer_class = ModerationActionPostSerializer
    permission_classes = [IsModeratorOrAdmin]
    def get_queryset(self):
        return ModerationActionPost.objects.select_related(
            'moderator__user', 'target_post__profile__user'
        )
    def perform_create(self, serializer):
        serializer.save(moderator=self.request.user.profile)

class ModerationActionPostDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = ModerationActionPost.objects.select_related(
        'moderator__user', 'target_post__profile__user'
    )
    serializer_class = ModerationActionPostSerializer
    permission_classes = [IsModeratorOrAdmin]

class ModerationActionCommentListCreateView(generics.ListCreateAPIView):
    serializer_class = ModerationActionCommentSerializer
    permission_classes = [IsModeratorOrAdmin]
    def get_queryset(self):
        return ModerationActionComment.objects.select_related(
            'moderator__user', 'target_comment__profile__user'
        )
    def perform_create(self, serializer):
        serializer.save(moderator=self.request.user.profile)

class ModerationActionCommentDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = ModerationActionComment.objects.select_related(
        'moderator__user', 'target_comment__profile__user'
    )
    serializer_class = ModerationActionCommentSerializer
    permission_classes = [IsModeratorOrAdmin]