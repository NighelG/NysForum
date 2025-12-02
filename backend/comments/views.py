
from django.shortcuts import get_object_or_404
from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from django.db.models import Prefetch
from django.http import HttpResponse
from django.utils import timezone
import traceback

from .models import Comment, CommentMedia
from .serializers import CommentSerializer, CommentCreateSerializer
from users.services.mongo_service import mongo_service

class CommentListCreateView(generics.ListCreateAPIView):
    serializer_class = CommentSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    def get_serializer_class(self):
        if self.request.method == 'POST':
            return CommentCreateSerializer
        return CommentSerializer
    def get_queryset(self):
        queryset = Comment.objects.select_related(
            'profile__user', 'post'
        ).prefetch_related(
            'media_files',
            Prefetch('replies', queryset=Comment.objects.select_related('profile__user').prefetch_related('media_files'))
        ).filter(parent__isnull=True)
        user_id = self.request.query_params.get('user_id')
        if user_id:
            queryset = queryset.filter(profile__user_id=user_id)
        return queryset
    def get_serializer_context(self):
        context = super().get_serializer_context()
        context['request'] = self.request
        return context
    def create(self, request, *args, **kwargs):
        media_files = request.FILES.getlist('media_files')
        comment_data = request.data.copy()
        if 'media_files' in comment_data:
            del comment_data['media_files']
        serializer = self.get_serializer(data=comment_data)
        serializer.is_valid(raise_exception=True)
        try:
            comment = serializer.save(profile=request.user.profile)
            if media_files:
                created_media = self._process_media_files(comment, media_files, request.data)
                print(f"Archivos de comentario procesados: {len(created_media)}")
            comment_with_media = Comment.objects.prefetch_related('media_files').get(id=comment.id)
            response_serializer = CommentSerializer(comment_with_media, context=self.get_serializer_context())
            return Response(response_serializer.data, status=status.HTTP_201_CREATED)
        except Exception as e:
            print(f"Error en creación de comentario: {str(e)}")
            print(f"Traceback: {traceback.format_exc()}")
            return Response(
                {'error': f'Error creando el comentario: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    def _process_media_files(self, comment, media_files, request_data):
        created_media = []
        for i, file in enumerate(media_files):
            try:
                media_type = self._get_media_type(file.content_type)
                if not media_type:
                    continue
                metadata = {
                    'comment_id': str(comment.id),
                    'post_id': str(comment.post.id),
                    'user_id': str(comment.profile.user.id),
                    'username': comment.profile.user.username,
                    'media_type': media_type,
                    'original_filename': file.name,
                    'uploaded_at': str(timezone.now())
                }
                file_id = mongo_service.save_file(file, metadata)
                if not file_id:
                    print(f"Error: No se pudo guardar el archivo {file.name} en MongoDB")
                    continue
                comment_media = CommentMedia.objects.create(
                    comment=comment,
                    file_id=file_id,
                    filename=file.name,
                    media_type=media_type,
                    content_type=file.content_type,
                    file_size=file.size
                )
                created_media.append(comment_media)
            except Exception as e:
                print(f"Error procesando archivo {file.name}: {str(e)}")
                continue
        return created_media
    def _get_media_type(self, content_type):
        if content_type.startswith('image/'):
            return 'image'
        elif content_type.startswith('video/'):
            return 'video'
        elif content_type.startswith('audio/'):
            return 'audio'
        return None

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
        self._delete_comment_media(instance)
        instance.delete()
    def _delete_comment_media(self, comment):
        try:
            media_files = comment.media_files.all()
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

class CommentMediaGetView(APIView):
    permission_classes = [permissions.AllowAny]
    def get(self, request, file_id):
        try:
            comment_media = get_object_or_404(CommentMedia, file_id=file_id)
            file = mongo_service.get_file(file_id)
            
            if not file:
                print(f"Archivo no encontrado en MongoDB: {file_id}")
                return Response(
                    {'error': 'Archivo no encontrado en el almacenamiento'},
                    status=status.HTTP_404_NOT_FOUND
                )
            file_content = file.read()
            response = HttpResponse(
                file_content,
                content_type=file.content_type,
                status=200
            )
            response['Content-Disposition'] = f'inline; filename="{comment_media.filename}"'
            response['Cache-Control'] = 'public, max-age=3600'
            response['X-Filename'] = comment_media.filename
            response['X-Media-Type'] = comment_media.media_type
            return response
        except CommentMedia.DoesNotExist:
            print(f"CommentMedia no encontrado para file_id: {file_id}")
            return Response(
                {'error': 'Recurso multimedia no encontrado'},
                status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            print(f"Error obteniendo media: {str(e)}")
            print(f"Traceback: {traceback.format_exc()}")
            return Response(
                {'error': 'Error interno del servidor'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )