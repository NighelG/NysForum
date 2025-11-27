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
    class Meta:
        model = PostMedia
        fields = ['id', 'file', 'media_type', 'uploaded_at']
        read_only_fields = ['id', 'uploaded_at']

class PostMediaCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = PostMedia
        fields = ['file', 'media_type']

class PostListSerializer(serializers.ModelSerializer):
    profile = ProfileMinimalSerializer(read_only=True)
    categories = CategorySerializer(many=True, read_only=True)
    likes_count = serializers.SerializerMethodField()
    dislikes_count = serializers.SerializerMethodField()
    comments_count = serializers.SerializerMethodField()
    user_reaction = serializers.SerializerMethodField()
    reports_count = serializers.SerializerMethodField()
    class Meta:
        model = Post
        fields = [
            'id', 'profile', 'title', 'content', 'categories', 'is_pinned',
            'views_count', 'likes_count', 'dislikes_count', 'comments_count',
            'user_reaction', 'reports_count', 'created_at', 'updated_at'
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
        for media_data in media_files_data:
            PostMedia.objects.create(post=post, **media_data)
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