from django.db import IntegrityError, transaction
from django.utils import timezone
from django.db.models import Count
from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView

from posts.models import Post
from comments.models import Comment
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
    
class ReportPostCreateView(generics.CreateAPIView):
    queryset = ReportPost.objects.all()
    serializer_class = ReportPostSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def perform_create(self, serializer):
        report = serializer.save(reporter=self.request.user.profile)
        try:
            if report.post.profile != self.request.user.profile:
                Notification.objects.create(
                    recipient=report.post.profile,
                    message=f'Tu post "{report.post.title[:50]}..." ha sido reportado. Razón: {report.get_category_display()}'
                )
        except:
            pass

class ReportCommentCreateView(generics.CreateAPIView):
    queryset = ReportComment.objects.all()
    serializer_class = ReportCommentSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def perform_create(self, serializer):
        report = serializer.save(reporter=self.request.user.profile)
        try:
            if report.comment.profile != self.request.user.profile:
                Notification.objects.create(
                    recipient=report.comment.profile,
                    message=f'Tu comentario en el post "{report.comment.post.title[:50]}..." ha sido reportado. Razón: {report.get_category_display()}'
                )
        except:
            pass

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

class ModerationActionPostListCreateView(generics.ListCreateAPIView):
    serializer_class = ModerationActionPostSerializer
    permission_classes = [IsAdminOrTrueAdmin]
    
    def get_queryset(self):
        queryset = ModerationActionPost.objects.select_related(
            'moderator__user', 'target_post__profile__user'
        ).order_by('-created_at')
        
        action = self.request.query_params.get('action')
        moderator_id = self.request.query_params.get('moderator_id')
        
        if action:
            queryset = queryset.filter(action=action)
        if moderator_id:
            queryset = queryset.filter(moderator_id=moderator_id)
            
        return queryset
    
    def perform_create(self, serializer):
        action = serializer.validated_data.get('action')
        target_post = serializer.validated_data.get('target_post')
        
        if action == 'delete' and target_post:
            if hasattr(target_post, 'media_files'):
                for media in target_post.media_files.all():
                    try:
                        from users.services.mongo_service import mongo_service
                        mongo_service.delete_file(media.file_id)
                    except:
                        pass
            
            ReportPost.objects.filter(
                post=target_post, 
                status='pending'
            ).update(
                status='resolved',
                resolved_by=self.request.user.profile,
                resolved_at=timezone.now(),
                admin_notes=f'Post eliminado por acción de moderación'
            )
        
        serializer.save(moderator=self.request.user.profile)

class ModerationActionCommentListCreateView(generics.ListCreateAPIView):
    serializer_class = ModerationActionCommentSerializer
    permission_classes = [IsAdminOrTrueAdmin]
    
    def get_queryset(self):
        queryset = ModerationActionComment.objects.select_related(
            'moderator__user', 'target_comment__profile__user'
        ).order_by('-created_at')
        
        action = self.request.query_params.get('action')
        moderator_id = self.request.query_params.get('moderator_id')
        
        if action:
            queryset = queryset.filter(action=action)
        if moderator_id:
            queryset = queryset.filter(moderator_id=moderator_id)
            
        return queryset
    
    def perform_create(self, serializer):
        action = serializer.validated_data.get('action')
        target_comment = serializer.validated_data.get('target_comment')
        
        if action == 'delete' and target_comment:
            if hasattr(target_comment, 'media_files'):
                for media in target_comment.media_files.all():
                    try:
                        from users.services.mongo_service import mongo_service
                        mongo_service.delete_file(media.file_id)
                    except:
                        pass
            
            ReportComment.objects.filter(
                comment=target_comment, 
                status='pending'
            ).update(
                status='resolved',
                resolved_by=self.request.user.profile,
                resolved_at=timezone.now(),
                admin_notes=f'Comentario eliminado por acción de moderación'
            )
        
        serializer.save(moderator=self.request.user.profile)

class ModerationActionPostDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = ModerationActionPost.objects.select_related(
        'moderator__user', 'target_post__profile__user'
    )
    serializer_class = ModerationActionPostSerializer
    permission_classes = [IsAdminOrTrueAdmin]

class ModerationActionCommentDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = ModerationActionComment.objects.select_related(
        'moderator__user', 'target_comment__profile__user'
    )
    serializer_class = ModerationActionCommentSerializer
    permission_classes = [IsAdminOrTrueAdmin]
    
class UnifiedReportsListView(generics.ListAPIView):
    permission_classes = [IsAdminOrTrueAdmin]
    
    def get(self, request, *args, **kwargs):
        status_param = request.query_params.get('status', 'pending')
        content_type = request.query_params.get('type')
        category = request.query_params.get('category')
        
        post_reports = ReportPost.objects.select_related(
            'reporter__user', 
            'post__profile__user',
            'resolved_by__user'
        ).all()
        
        comment_reports = ReportComment.objects.select_related(
            'reporter__user', 
            'comment__profile__user',
            'comment__post',
            'resolved_by__user'
        ).all()
        
        if status_param:
            post_reports = post_reports.filter(status=status_param)
            comment_reports = comment_reports.filter(status=status_param)
        
        if category:
            post_reports = post_reports.filter(category=category)
            comment_reports = comment_reports.filter(category=category)
        
        post_reports = post_reports.order_by('-created_at')
        comment_reports = comment_reports.order_by('-created_at')
        
        if content_type == 'post':
            post_reports = post_reports[:100]
            comment_reports = comment_reports.none()
        elif content_type == 'comment':
            comment_reports = comment_reports[:100]
            post_reports = post_reports.none()
        else:
            post_reports = post_reports[:50]
            comment_reports = comment_reports[:50]
        
        post_serializer = ReportPostSerializer(post_reports, many=True)
        comment_serializer = ReportCommentSerializer(comment_reports, many=True)
        
        return Response({
            'post_reports': post_serializer.data,
            'comment_reports': comment_serializer.data,
            'total_post_reports': len(post_serializer.data),
            'total_comment_reports': len(comment_serializer.data),
            'total': len(post_serializer.data) + len(comment_serializer.data),
            'filters': {
                'status': status_param,
                'type': content_type,
                'category': category
            }
        }, status=status.HTTP_200_OK)

class ResolveReportView(APIView):
    permission_classes = [IsAdminOrTrueAdmin]
    
    def post(self, request, report_type, report_id):
        try:
            if report_type == 'post':
                report = ReportPost.objects.get(id=report_id)
                content = report.post
                content_type_str = 'post'
            elif report_type == 'comment':
                report = ReportComment.objects.get(id=report_id)
                content = report.comment
                content_type_str = 'comment'
            else:
                return Response(
                    {'error': 'Tipo de reporte inválido. Use "post" o "comment"'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            new_status = request.data.get('status', 'resolved')
            action_taken = request.data.get('action', 'none')
            admin_notes = request.data.get('notes', '')
            
            valid_statuses = ['pending', 'reviewed', 'resolved', 'dismissed']
            if new_status not in valid_statuses:
                return Response(
                    {'error': f'Estado inválido. Use: {", ".join(valid_statuses)}'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            with transaction.atomic():
                report.status = new_status
                report.resolved_by = request.user.profile
                report.resolved_at = timezone.now() if new_status in ['resolved', 'dismissed'] else None
                report.admin_notes = admin_notes
                report.save()
                
                action_message = 'ninguna acción adicional'
                
                ACTION_MAPPING = {
                    'remove': 'delete',
                    'warn': 'warn',
                    'reviewed': 'review',
                    'dismissed': 'dismiss',
                    'none': 'approve'
                }
                
                log_action = ACTION_MAPPING.get(action_taken, 'approve')
                
                try:
                    if content_type_str == 'post':
                        target_post = content if content else report.post
                        if target_post:
                            ModerationActionPost.objects.create(
                                moderator=request.user.profile,
                                target_post=target_post,
                                action=log_action,
                                reason=f"Reporte #{report_id}: {admin_notes}" if admin_notes else f"Estado: {new_status}"
                            )
                    elif content_type_str == 'comment':
                        target_comment = content if content else report.comment
                        if target_comment:
                            ModerationActionComment.objects.create(
                                moderator=request.user.profile,
                                target_comment=target_comment,
                                action=log_action,
                                reason=f"Reporte #{report_id}: {admin_notes}" if admin_notes else f"Estado: {new_status}"
                            )
                except Exception as e:
                    print(f"[Moderation Log] Error creando registro: {str(e)}")
                
                if action_taken == 'remove' and content:
                    if content_type_str == 'post':
                        self._delete_post_media(content)
                    else:
                        self._delete_comment_media(content)
                    
                    content.delete()
                    action_message = f'{content_type_str} eliminado'
                    
                    try:
                        recipient = report.post.profile if content_type_str == 'post' else report.comment.profile
                        Notification.objects.create(
                            recipient=recipient,
                            message=f'Tu {content_type_str} ha sido eliminado por un moderador. Razón: {admin_notes[:100]}...'
                        )
                    except Exception as e:
                        print(f"Error creando notificación: {str(e)}")
                        
                elif action_taken == 'warn' and content:
                    try:
                        Notification.objects.create(
                            recipient=content.profile,
                            message=f'Has recibido una advertencia por tu {content_type_str}. Razón: {admin_notes[:100]}...'
                        )
                    except Exception as e:
                        print(f"Error creando notificación: {str(e)}")
                    
                    action_message = 'usuario advertido'
                
                if action_taken == 'reviewed':
                    action_message = 'reporte marcado como revisado'
                elif action_taken == 'dismissed':
                    action_message = 'reporte desestimado'
            
            return Response({
                'message': f'Reporte {content_type_str} #{report_id} actualizado a "{new_status}"',
                'status': new_status,
                'action_taken': action_taken,
                'action_message': action_message,
                'resolved_by': request.user.profile.user.username,
                'resolved_at': report.resolved_at
            }, status=status.HTTP_200_OK)
            
        except (ReportPost.DoesNotExist, ReportComment.DoesNotExist):
            return Response(
                {'error': 'Reporte no encontrado'},
                status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            import traceback
            print(f"Error en ResolveReportView: {str(e)}")
            print(traceback.format_exc())
            return Response(
                {'error': f'Error interno: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    def _delete_post_media(self, post):
        try:
            from posts.models import PostMedia
            from users.services.mongo_service import mongo_service
            media_files = PostMedia.objects.filter(post=post)
            for media in media_files:
                try:
                    if mongo_service.delete_file(media.file_id):
                        print(f"Archivo eliminado de MongoDB: {media.file_id}")
                    else:
                        print(f"Error eliminando archivo de MongoDB: {media.file_id}")
                except Exception as e:
                    print(f"Error eliminando archivo {media.file_id}: {str(e)}")
        except Exception as e:
            print(f"Error eliminando medios del post: {str(e)}")
    
    def _delete_comment_media(self, comment):
        try:
            from comments.models import CommentMedia
            from users.services.mongo_service import mongo_service
            
            media_files = CommentMedia.objects.filter(comment=comment)
            for media in media_files:
                try:
                    if mongo_service.delete_file(media.file_id):
                        print(f"Archivo de comentario eliminado de MongoDB: {media.file_id}")
                    else:
                        print(f"Error eliminando archivo de comentario de MongoDB: {media.file_id}")
                except Exception as e:
                    print(f"Error eliminando archivo {media.file_id}: {str(e)}")
        except Exception as e:
            print(f"Error eliminando medios del comentario: {str(e)}")

class ReportStatsView(APIView):
    permission_classes = [IsAdminOrTrueAdmin]
    
    def get(self, request):
        post_reports_by_status = list(ReportPost.objects.values('status').annotate(
            count=Count('id')
        ).order_by('status'))
        
        comment_reports_by_status = list(ReportComment.objects.values('status').annotate(
            count=Count('id')
        ).order_by('status'))
        
        post_reports_by_category = list(ReportPost.objects.values('category').annotate(
            count=Count('id')
        ).order_by('category'))
        
        comment_reports_by_category = list(ReportComment.objects.values('category').annotate(
            count=Count('id')
        ).order_by('category'))

        pending_post_reports = ReportPost.objects.filter(status='pending').count()
        pending_comment_reports = ReportComment.objects.filter(status='pending').count()

        recent_post_actions_qs = ModerationActionPost.objects.select_related(
            'moderator__user', 'target_post__profile__user'
        ).order_by('-created_at')[:5]
        
        recent_comment_actions_qs = ModerationActionComment.objects.select_related(
            'moderator__user', 'target_comment__profile__user'
        ).order_by('-created_at')[:5]

        post_serializer = ModerationActionPostSerializer(recent_post_actions_qs, many=True)
        comment_serializer = ModerationActionCommentSerializer(recent_comment_actions_qs, many=True)
        
        return Response({
            'stats': {
                'total_post_reports': ReportPost.objects.count(),
                'total_comment_reports': ReportComment.objects.count(),
                'total_reports': ReportPost.objects.count() + ReportComment.objects.count(),
                'pending_post_reports': pending_post_reports,
                'pending_comment_reports': pending_comment_reports,
                'total_pending': pending_post_reports + pending_comment_reports,
                'resolved_today': ReportPost.objects.filter(
                    resolved_at__date=timezone.now().date()
                ).count() + ReportComment.objects.filter(
                    resolved_at__date=timezone.now().date()
                ).count()
            },
            'post_reports_by_status': post_reports_by_status,
            'comment_reports_by_status': comment_reports_by_status,
            'post_reports_by_category': post_reports_by_category,
            'comment_reports_by_category': comment_reports_by_category,
            'recent_actions': {
                'post_actions': post_serializer.data,
                'comment_actions': comment_serializer.data
            }
        }, status=status.HTTP_200_OK)