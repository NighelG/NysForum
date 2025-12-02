from rest_framework import serializers
from .models import Comment, CommentMedia
from users.serializers import ProfileMinimalSerializer

class CommentMediaSerializer(serializers.ModelSerializer):
    file_url = serializers.SerializerMethodField()
    file_info = serializers.SerializerMethodField()
    class Meta:
        model = CommentMedia
        fields = [
            'id', 'file_id', 'filename', 'media_type', 'content_type',
            'file_size', 'file_url', 'file_info', 'uploaded_at'
        ]
        read_only_fields = ['id', 'uploaded_at']
    def get_file_url(self, obj):
        if not obj.file_id:
            return None
        request = self.context.get('request')
        if request:
            return f"{request.build_absolute_uri('/')}api/comments/media/{obj.file_id}/"
        return f"/api/comments/media/{obj.file_id}/"
    def get_file_info(self, obj):
        if not obj.file_id:
            return None
        return {
            'filename': obj.filename,
            'content_type': obj.content_type,
            'file_size': obj.file_size,
            'media_type': obj.media_type
        }

class CommentMediaCreateSerializer(serializers.Serializer):
    file = serializers.FileField(required=False)
    media_type = serializers.ChoiceField(choices=CommentMedia.MEDIA_TYPES, required=False)
    
    def validate(self, data):
        file = data.get('file')
        media_type = data.get('media_type')
        if file:
            content_type = file.content_type
            if media_type == 'image' and not content_type.startswith('image/'):
                raise serializers.ValidationError({
                    'file': 'El archivo debe ser una imagen (JPEG, PNG, GIF, WebP)'
                })
            elif media_type == 'video' and not content_type.startswith('video/'):
                raise serializers.ValidationError({
                    'file': 'El archivo debe ser un video (MP4, WebM, etc.)'
                })
            elif media_type == 'audio' and not content_type.startswith('audio/'):
                raise serializers.ValidationError({
                    'file': 'El archivo debe ser un audio (MP3, WAV, etc.)'
                })
            max_size = 10 * 1024 * 1024
            if file.size > max_size:
                raise serializers.ValidationError({
                    'file': f'El archivo no debe exceder los 10MB. Tamaño actual: {file.size / 1024 / 1024:.1f}MB'
                })
        
        return data

class CommentReplySerializer(serializers.ModelSerializer):
    profile = ProfileMinimalSerializer(read_only=True)
    media_files = CommentMediaSerializer(many=True, read_only=True)
    likes_count = serializers.ReadOnlyField()
    dislikes_count = serializers.ReadOnlyField()
    user_reaction = serializers.SerializerMethodField()
    class Meta:
        model = Comment
        fields = [
            'id', 'profile', 'content', 'media_files',
            'likes_count', 'dislikes_count', 'user_reaction',
            'created_at'
        ]
    def get_user_reaction(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated and hasattr(request.user, 'profile'):
            try:
                from moderation.models import ReactionComment
                reaction = ReactionComment.objects.filter(
                    comment=obj,
                    profile=request.user.profile
                ).first()
                return reaction.type if reaction else None
            except Exception as e:
                print(f"Error en get_user_reaction para comment {obj.id}: {e}")
        return None


class CommentSerializer(serializers.ModelSerializer):
    profile = ProfileMinimalSerializer(read_only=True)
    media_files = CommentMediaSerializer(many=True, read_only=True)
    likes_count = serializers.ReadOnlyField()
    dislikes_count = serializers.ReadOnlyField()
    replies = CommentReplySerializer(many=True, read_only=True)
    replies_count = serializers.SerializerMethodField()
    reports_count = serializers.ReadOnlyField()
    user_reaction = serializers.SerializerMethodField()
    class Meta:
        model = Comment
        fields = [
            'id', 'post', 'profile', 'parent', 'content', 'media_files',
            'likes_count', 'dislikes_count', 'replies', 'replies_count',
            'reports_count', 'user_reaction', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'profile', 'created_at', 'updated_at']
    def get_replies_count(self, obj):
        return obj.replies.count()  
    def get_user_reaction(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated and hasattr(request.user, 'profile'):
            try:
                from moderation.models import ReactionComment
                reaction = ReactionComment.objects.filter(
                    comment=obj,
                    profile=request.user.profile
                ).first()
                return reaction.type if reaction else None
            except Exception as e:
                print(f"Error en get_user_reaction para comment {obj.id}: {e}")
        return None

class CommentCreateSerializer(serializers.ModelSerializer):
    media_files = CommentMediaCreateSerializer(many=True, required=False)
    class Meta:
        model = Comment
        fields = ['post', 'parent', 'content', 'media_files']
    def validate_content(self, value):
        if len(value) < 2:
            raise serializers.ValidationError("El comentario debe tener al menos 2 caracteres")
        return value
    def create(self, validated_data):
        media_files_data = validated_data.pop('media_files', [])
        comment = Comment.objects.create(**validated_data)
        request = self.context.get('request')
        if request and media_files_data:
            self._process_media_files(comment, request.FILES.getlist('media_files'), request.data)
        return comment
    def _process_media_files(self, comment, media_files, request_data):
        for i, file in enumerate(media_files):
            try:
                from django.utils import timezone
                from users.services.mongo_service import mongo_service
                media_type = self._get_media_type(file.content_type)
                if not media_type:
                    continue
                metadata = {
                    'comment_id': str(comment.id),
                    'post_id': str(comment.post.id) if comment.post else None,
                    'user_id': str(comment.profile.user.id),
                    'username': comment.profile.user.username,
                    'media_type': media_type,
                    'original_filename': file.name,
                    'uploaded_at': str(timezone.now())
                }
                file_id = mongo_service.save_file(file, metadata)
                if not file_id:
                    continue
                CommentMedia.objects.create(
                    comment=comment,
                    file_id=file_id,
                    filename=file.name,
                    media_type=media_type,
                    content_type=file.content_type,
                    file_size=file.size
                )
            except Exception as e:
                print(f"Error procesando archivo {file.name}: {str(e)}")
                continue
    def _get_media_type(self, content_type):
        if content_type.startswith('image/'):
            return 'image'
        elif content_type.startswith('video/'):
            return 'video'
        elif content_type.startswith('audio/'):
            return 'audio'
        return None