from django.shortcuts import get_object_or_404
from rest_framework import generics, status
from rest_framework.permissions import AllowAny, IsAuthenticated, IsAuthenticatedOrReadOnly
from rest_framework.response import Response
from rest_framework.views import APIView
from django.contrib.auth.models import User
from django.utils import timezone
from django.http import HttpResponse
import traceback
from .services.mongo_service import mongo_service
from .models import Profile
from .serializers import (
    UserRegistrationSerializer,
    ProfileSerializer,
    ProfileUpdateSerializer,
    ProfileDeleteSerializer,
    AdminProfileDeleteSerializer
)

class RegisterView(generics.CreateAPIView):
    serializer_class = UserRegistrationSerializer
    permission_classes = [AllowAny]
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        return Response(
            {'message': 'Usuario registrado exitosamente', 'username': user.username},
            status=status.HTTP_201_CREATED
        )

class ProfileListView(generics.ListAPIView):
    queryset = Profile.objects.select_related('user').all()
    serializer_class = ProfileSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]

class ProfileDetailView(generics.RetrieveUpdateAPIView):
    queryset = Profile.objects.select_related('user').all()
    serializer_class = ProfileSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]
    def get_object(self):
        username = self.kwargs.get('username')
        return get_object_or_404(Profile, user__username=username)
    def update(self, request, *args, **kwargs):
        profile = self.get_object()
        if profile.user != request.user:
            return Response(
                {'error': 'No tienes permiso para editar este perfil'},
                status=status.HTTP_403_FORBIDDEN
            )
        return super().update(request, *args, **kwargs)

class ProfileMeView(generics.RetrieveUpdateAPIView):
    serializer_class = ProfileSerializer
    permission_classes = [IsAuthenticated]
    def get_object(self):
        return self.request.user.profile

class ProfileDeleteView(APIView):
    permission_classes = [IsAuthenticated]
    def post(self, request, *args, **kwargs):
        serializer = ProfileDeleteSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = request.user
        if hasattr(user, 'profile') and user.profile.avatar:
            try:
                mongo_service.delete_image(user.profile.avatar)
            except Exception as e:
                print(f"Error eliminando avatar: {e}")
        username = user.username
        user.delete()
        return Response(
            {
                'message': f'Perfil de {username} eliminado exitosamente',
                'deleted_username': username
            },
            status=status.HTTP_200_OK
        )

class AdminProfileDeleteView(APIView):
    permission_classes = [IsAuthenticated]
    def post(self, request, username):
        if not hasattr(request.user, 'profile'):
            return Response(
                {'error': 'Perfil de usuario no encontrado'},
                status=status.HTTP_400_BAD_REQUEST
            )
        current_profile = request.user.profile
        if current_profile.role not in ['admin', 'true_admin']:
            return Response(
                {'error': 'Se requieren privilegios de administrador'},
                status=status.HTTP_403_FORBIDDEN
            )
        serializer = AdminProfileDeleteSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        profile_to_delete = get_object_or_404(
            Profile.objects.select_related('user'),
            user__username=username
        )
        if not self.can_delete_profile(current_profile, profile_to_delete):
            return Response(
                {'error': 'No tienes permisos para eliminar este perfil'},
                status=status.HTTP_403_FORBIDDEN
            )
        if profile_to_delete.avatar:
            try:
                mongo_service.delete_image(profile_to_delete.avatar)
            except Exception as e:
                print(f"Error eliminando avatar: {e}")
        deleted_username = profile_to_delete.user.username
        deleted_role = profile_to_delete.role
        reason = serializer.validated_data.get('reason', '')
        profile_to_delete.user.delete()
        message = f'Perfil de {deleted_username} ({deleted_role}) eliminado por admin'
        if reason:
            message += f'. Razón: {reason}'
        return Response(
            {
                'message': message,
                'deleted_username': deleted_username,
                'deleted_by': request.user.username,
                'reason': reason if reason else None
            },
            status=status.HTTP_200_OK
        )
    def can_delete_profile(self, current_profile, target_profile):
        current_role = current_profile.role
        target_role = target_profile.role
        if current_role == 'true_admin':
            return True
        if current_role == 'admin':
            return target_role in ['user', 'moderator'] and target_profile.user != current_profile.user
        return False

class ProfileAvatarUpdateView(APIView):
    permission_classes = [IsAuthenticated]
    def patch(self, request):
        print("=== INICIANDO ACTUALIZACIÓN DE AVATAR ===")
        print(f"Usuario: {request.user.username}")
        print(f"Headers: {dict(request.headers)}")
        print(f"Archivos recibidos: {list(request.FILES.keys())}")
        profile = request.user.profile
        if 'avatar' not in request.FILES:
            return Response(
                {'error': 'No se envió avatar'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        avatar_file = request.FILES['avatar']
        print(f" Archivo recibido: {avatar_file.name}, "
                f"Tamaño: {avatar_file.size}, "
                f"Tipo: {avatar_file.content_type}")
        allowed_types = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
        if avatar_file.content_type not in allowed_types:
            return Response(
                {'error': 'Tipo de archivo no permitido. Use JPEG, PNG, GIF o WebP'},
                status=status.HTTP_400_BAD_REQUEST
            )
        if avatar_file.size > 5 * 1024 * 1024:
            return Response(
                {'error': 'La imagen no debe pesar más de 5MB'},
                status=status.HTTP_400_BAD_REQUEST
            )
        try:
            if profile.avatar:
                print(f" Eliminando avatar anterior: {profile.avatar}")
                try:
                    mongo_service.delete_file(profile.avatar)
                except Exception as e:
                    print(f" Error eliminando avatar anterior: {e}")
            metadata = {
                'user_id': str(request.user.id),
                'username': request.user.username,
                'uploaded_at': str(timezone.now())
            }
            print(" Guardando nuevo avatar en GridFS...")
            file_id = mongo_service.save_image(avatar_file, metadata)
            if not file_id:
                print(" ERROR: save_image retornó None")
                return Response(
                    {'error': 'Error guardando la imagen en el almacenamiento'},
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR
                )
            print(f" Avatar guardado con ID: {file_id}")
            profile.avatar = file_id
            profile.save()
            print(f" Perfil actualizado. Avatar ID en SQL: {profile.avatar}")
            print(" Listando archivos en GridFS para diagnóstico:")
            mongo_service.list_files()
            return Response(
                {
                    'message': 'Avatar actualizado correctamente', 
                    'avatar_id': file_id,
                    'avatar_url': f'/users/profiles/{request.user.username}/avatar/'
                },
                status=status.HTTP_200_OK
            )
        except Exception as e:
            print(f" ERROR en actualización de avatar: {str(e)}")
            print(f" Traceback: {traceback.format_exc()}")
            return Response(
                {'error': f'Error interno del servidor: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

class ProfileAvatarGetView(APIView):
    permission_classes = [AllowAny]
    def get(self, request, username):
        try:
            print(f" Solicitando avatar para usuario: {username}")
            profile = get_object_or_404(Profile, user__username=username)
            if not profile.avatar:
                print(f" Usuario {username} no tiene avatar en SQL")
                return Response(
                    {'error': 'El usuario no tiene avatar'}, 
                    status=status.HTTP_404_NOT_FOUND
                )
            print(f" Avatar ID en SQL: {profile.avatar}")
            file = mongo_service.get_image(profile.avatar)
            if not file:
                print(f" Avatar no encontrado en GridFS: {profile.avatar}")
                return Response(
                    {'error': 'Avatar no encontrado en almacenamiento'},
                    status=status.HTTP_404_NOT_FOUND
                )
            print(f" Avatar encontrado en GridFS: {file.filename}, tipo: {file.content_type}")
            file_content = file.read()
            print(f" Tamaño del archivo leído: {len(file_content)} bytes")
            response = HttpResponse(
                file_content,
                content_type=file.content_type,
                status=200
            )
            response['Cache-Control'] = 'no-cache, no-store, must-revalidate'
            response['Pragma'] = 'no-cache'
            response['Expires'] = '0'
            return response
        except Exception as e:
            print(f" Error obteniendo avatar: {e}")
            print(f" Traceback: {traceback.format_exc()}")
            return Response(
                {'error': 'Error interno del servidor'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

class UserDeleteView(APIView):
    permission_classes = [IsAuthenticated]
    def delete(self, request, *args, **kwargs):
        user = request.user
        if hasattr(user, 'profile') and user.profile.avatar:
            try:
                mongo_service.delete_image(user.profile.avatar)
            except Exception as e:
                print(f"Error eliminando avatar: {e}")
        username = user.username
        user.delete()
        return Response(
            {
                'message': f'Usuario {username} eliminado exitosamente',
                'deleted_username': username
            },
            status=status.HTTP_200_OK
        )
    
class TestMongoDBView(APIView):
    permission_classes = [AllowAny]
    def get(self, request):
        try:
            print(" Iniciando prueba de MongoDB...")
            connection_ok = mongo_service.test_connection()
            print(" Intentando guardar archivo de prueba...")
            test_content = b"Este es un archivo de prueba para MongoDB GridFS"
            from io import BytesIO
            test_file = BytesIO(test_content)
            test_file.name = "test_file.txt" 
            file_id = mongo_service.save_file(test_file, {'test': True, 'timestamp': str(timezone.now())})
            files = mongo_service.list_files()
            return Response({
                'connection_ok': connection_ok,
                'test_file_id': file_id,
                'total_files': len(files),
                'files': [
                    {
                        'id': str(f['_id']),
                        'filename': f.get('filename', 'N/A'),
                        'content_type': f.get('content_type', 'N/A'),
                        'length': f.get('length', 0),
                        'upload_date': str(f.get('uploadDate', 'N/A')),
                        'metadata': f.get('metadata', {})
                    } for f in files
                ]
            })
        except Exception as e:
            print(f" Error en TestMongoDBView: {e}")
            print(f" Traceback: {traceback.format_exc()}")
            return Response({'error': str(e)}, status=500)