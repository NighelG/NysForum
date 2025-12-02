from rest_framework import serializers
from .models import Category, Post, PostMedia, PostView
from users.serializers import ProfileMinimalSerializer

class CategorySerializer(serializers.ModelSerializer):
    posts_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Category
        fields = ['id', 'name', 'description', 'posts_count', 'created_at']
        read_only_fields = ['id', 'created_at']
    
    def get_posts_count(self, obj):
        return obj.posts.count()

class PostMediaSerializer(serializers.ModelSerializer):
    file_url = serializers.SerializerMethodField()
    file_info = serializers.SerializerMethodField()
    
    class Meta:
        model = PostMedia
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
            return f"{request.build_absolute_uri('/')}api/posts/media/{obj.file_id}/"
        return f"/api/posts/media/{obj.file_id}/"
    
    def get_file_info(self, obj):
        if not obj.file_id:
            return None
        return {
            'filename': obj.filename,
            'content_type': obj.content_type,
            'file_size': obj.file_size,
            'media_type': obj.media_type
        }

class PostMediaCreateSerializer(serializers.Serializer):
    file = serializers.FileField(required=False)
    media_type = serializers.ChoiceField(choices=PostMedia.MEDIA_TYPES, required=False)
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

class PostListSerializer(serializers.ModelSerializer):
    profile = ProfileMinimalSerializer(read_only=True)
    categories = CategorySerializer(many=True, read_only=True)
    likes_count = serializers.SerializerMethodField()
    dislikes_count = serializers.SerializerMethodField()
    comments_count = serializers.SerializerMethodField()
    user_reaction = serializers.SerializerMethodField()
    reports_count = serializers.SerializerMethodField()
    first_media = serializers.SerializerMethodField()
    media_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Post
        fields = [
            'id', 'profile', 'title', 'content', 'categories', 'is_pinned',
            'views_count', 'likes_count', 'dislikes_count', 'comments_count',
            'user_reaction', 'reports_count', 'first_media', 'media_count',
            'created_at', 'updated_at'
        ]
    
    def get_likes_count(self, obj):
        return obj.likes_count
    
    def get_dislikes_count(self, obj):
        return obj.dislikes_count
    
    def get_comments_count(self, obj):
        return obj.comments.count()
    
    def get_reports_count(self, obj):
        return obj.reports_count
    
    def get_user_reaction(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            profile = getattr(request.user, 'profile', None)
            if profile:
                reaction = obj.reactions.filter(profile=profile).first()
                return reaction.type if reaction else None
        return None
    
    def get_first_media(self, obj):
        first_media = obj.media_files.first()
        if first_media and first_media.file_id:
            return PostMediaSerializer(first_media, context=self.context).data
        return None
    
    def get_media_count(self, obj):
        return obj.media_files.filter(file_id__isnull=False).count()

class PostDetailSerializer(serializers.ModelSerializer):
    profile = ProfileMinimalSerializer(read_only=True)
    categories = CategorySerializer(many=True, read_only=True)
    media_files = PostMediaSerializer(many=True, read_only=True)
    likes_count = serializers.SerializerMethodField()
    dislikes_count = serializers.SerializerMethodField()
    comments_count = serializers.SerializerMethodField()
    reports_count = serializers.SerializerMethodField()
    class Meta:
        model = Post
        fields = '__all__'
        read_only_fields = ('profile', 'views_count', 'created_at', 'updated_at')
    def get_likes_count(self, obj):
        return obj.likes_count
    def get_dislikes_count(self, obj):
        return obj.dislikes_count
    def get_comments_count(self, obj):
        return obj.comments.count()
    def get_reports_count(self, obj):
        return obj.reports_count

class PostCreateSerializer(serializers.ModelSerializer):
    categories = serializers.PrimaryKeyRelatedField(
        many=True,
        queryset=Category.objects.all(),
        required=False
    )
    media_files = PostMediaCreateSerializer(many=True, required=False)
    class Meta:
        model = Post
        fields = ['title', 'content', 'categories', 'media_files']
    def validate_title(self, value):
        if len(value) < 5:
            raise serializers.ValidationError("El título debe tener al menos 5 caracteres")
        return value
    def validate_content(self, value):
        if len(value) < 10:
            raise serializers.ValidationError("El contenido debe tener al menos 10 caracteres")
        return value
    def create(self, validated_data):
        media_files_data = validated_data.pop('media_files', [])
        categories = validated_data.pop('categories', [])
        post = Post.objects.create(**validated_data)
        post.categories.set(categories)
        return post

class PostUpdateSerializer(serializers.ModelSerializer):
    categories = serializers.PrimaryKeyRelatedField(
        many=True,
        queryset=Category.objects.all()
    )
    class Meta:
        model = Post
        fields = '__all__'
        read_only_fields = ('profile', 'views_count', 'created_at', 'updated_at')
    def update(self, instance, validated_data):
        categories = validated_data.pop('categories', None)
        instance = super().update(instance, validated_data)
        if categories is not None:
            instance.categories.set(categories)
        return instance

class PostViewSerializer(serializers.ModelSerializer):
    class Meta:
        model = PostView
        fields = ['id', 'post', 'profile', 'viewed_at']
        read_only_fields = ['id', 'viewed_at']