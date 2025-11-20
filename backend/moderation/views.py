from django.db import IntegrityError, transaction
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
    serializer_class = ReactionPostSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return ReactionPost.objects.filter(profile=self.request.user.profile).select_related('profile__user', 'post')
    
    def create(self, request, *args, **kwargs):
        try:
            post_id = request.data.get('post')
            reaction_type = request.data.get('type')
            
            if not post_id or not reaction_type:
                return Response(
                    {'error': 'Se requieren post y type'}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
            with transaction.atomic():
                existing_reaction = ReactionPost.objects.filter(
                    post_id=post_id,
                    profile=request.user.profile
                ).first()
                if existing_reaction:
                    if existing_reaction.type == reaction_type:
                        existing_reaction.delete()
                        return Response({
                            'status': 'removed',
                            'message': 'Reacción eliminada'
                        }, status=status.HTTP_200_OK)
                    else:
                        existing_reaction.type = reaction_type
                        existing_reaction.save()
                        serializer = self.get_serializer(existing_reaction)
                        return Response({
                            'status': 'updated',
                            'data': serializer.data
                        }, status=status.HTTP_200_OK)
                else:
                    serializer = self.get_serializer(data=request.data)
                    serializer.is_valid(raise_exception=True)
                    serializer.save(profile=request.user.profile)
                    return Response({
                        'status': 'created',
                        'data': serializer.data
                    }, status=status.HTTP_201_CREATED)
        except IntegrityError as e:
            return Response(
                {'error': 'Error de integridad en la base de datos'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        except Exception as e:
            return Response(
                {'error': str(e)}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

class ReactionCommentListCreateView(generics.ListCreateAPIView):
    serializer_class = ReactionCommentSerializer
    permission_classes = [permissions.IsAuthenticated]
    def get_queryset(self):
        return ReactionComment.objects.filter(profile=self.request.user.profile).select_related('profile__user', 'comment')
    def create(self, request, *args, **kwargs):
        try:
            comment_id = request.data.get('comment')
            reaction_type = request.data.get('type')
            if not comment_id or not reaction_type:
                return Response(
                    {'error': 'Se requieren comment y type'}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
            with transaction.atomic():
                existing_reaction = ReactionComment.objects.filter(
                    comment_id=comment_id,
                    profile=request.user.profile
                ).first()
                if existing_reaction:
                    if existing_reaction.type == reaction_type:
                        existing_reaction.delete()
                        return Response({
                            'status': 'removed',
                            'message': 'Reacción eliminada'
                        }, status=status.HTTP_200_OK)
                    else:
                        existing_reaction.type = reaction_type
                        existing_reaction.save()
                        serializer = self.get_serializer(existing_reaction)
                        return Response({
                            'status': 'updated',
                            'data': serializer.data
                        }, status=status.HTTP_200_OK)
                else:
                    serializer = self.get_serializer(data=request.data)
                    serializer.is_valid(raise_exception=True)
                    serializer.save(profile=request.user.profile)
                    return Response({
                        'status': 'created',
                        'data': serializer.data
                    }, status=status.HTTP_201_CREATED)
        except IntegrityError as e:
            return Response(
                {'error': 'Error de integridad en la base de datos'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        except Exception as e:
            return Response(
                {'error': str(e)}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

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