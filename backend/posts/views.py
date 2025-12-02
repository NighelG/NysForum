from django.shortcuts import render, get_object_or_404
from rest_framework import generics, permissions, status
from rest_framework.exceptions import PermissionDenied
from rest_framework.response import Response
from rest_framework.views import APIView
from django.utils import timezone
from django.http import HttpResponse
import traceback

from users.services.mongo_service import mongo_service
from .models import Post, Category, PostMedia, PostView
from .serializers import (
    PostListSerializer, PostDetailSerializer, PostCreateSerializer, 
    CategorySerializer, PostUpdateSerializer, PostViewSerializer,
    PostMediaCreateSerializer
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
    queryset = Post.objects.select_related('profile__user').prefetch_related('categories', 'media_files')
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
    def create(self, request, *args, **kwargs):
        media_files = request.FILES.getlist('media_files')
        post_data = request.data.copy()
        if 'media_files' in post_data:
            del post_data['media_files']
        serializer = self.get_serializer(data=post_data)
        serializer.is_valid(raise_exception=True)
        try:
            post = serializer.save(profile=request.user.profile)
            if media_files:
                print(f"Procesando {len(media_files)} archivos multimedia...")
                created_media = self._process_media_files(post, media_files, request.data)
                print(f"Archivos procesados: {len(created_media)}")
            else:
                print("No hay archivos multimedia para procesar")
            post_with_media = Post.objects.prefetch_related('media_files').get(id=post.id)
            response_serializer = PostDetailSerializer(post_with_media, context=self.get_serializer_context())
            return Response(response_serializer.data, status=status.HTTP_201_CREATED)
        except Exception as e:
            print(f"Error en creación de post: {str(e)}")
            print(f"Traceback: {traceback.format_exc()}")
            return Response(
                {'error': f'Error creando el post: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    def _process_media_files(self, post, media_files, request_data):
        created_media = []
        for i, file in enumerate(media_files):
            try:
                media_type = self._get_media_type(file.content_type)
                if not media_type:
                    continue
                metadata = {
                    'post_id': str(post.id),
                    'user_id': str(post.profile.user.id),
                    'username': post.profile.user.username,
                    'media_type': media_type,
                    'original_filename': file.name,
                    'uploaded_at': str(timezone.now())
                }
                print(f"Guardando archivo en MongoDB: {file.name}")
                file_id = mongo_service.save_file(file, metadata)
                if not file_id:
                    print(f"Error: No se pudo guardar el archivo {file.name} en MongoDB")
                    continue
                print(f"Archivo guardado en MongoDB con ID: {file_id}")
                post_media = PostMedia.objects.create(
                    post=post,
                    file_id=file_id,
                    filename=file.name,
                    media_type=media_type,
                    content_type=file.content_type,
                    file_size=file.size
                )
                created_media.append(post_media)
            except Exception as e:
                print(f"Error procesando archivo {file.name}: {str(e)}")
                print(f"Traceback: {traceback.format_exc()}")
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
        self._delete_post_media(instance)
        instance.delete()
    def _delete_post_media(self, post):
        try:
            media_files = post.media_files.all()
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
        
class PostMediaGetView(APIView):
    permission_classes = [permissions.AllowAny]
    def get(self, request, file_id):
        try:
            post_media = get_object_or_404(PostMedia, file_id=file_id)
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
            response['Content-Disposition'] = f'inline; filename="{post_media.filename}"'
            response['Cache-Control'] = 'public, max-age=3600'
            response['X-Filename'] = post_media.filename
            response['X-Media-Type'] = post_media.media_type
            return response
        except PostMedia.DoesNotExist:
            print(f"PostMedia no encontrado para file_id: {file_id}")
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