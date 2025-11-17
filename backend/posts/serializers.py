from rest_framework import serializers
from .models import Category, Post, PostMedia
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
            if hasattr(request.user, 'profile'):
                reaction = obj.reactions.filter(
                    profile=request.user.profile
                ).first()
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
    def get_likes_count(self, obj):
        return obj.likes_count  
    def get_dislikes_count(self, obj):
        return obj.dislikes_count 
    def get_comments_count(self, obj):
        return obj.comments.count() 
    def get_reports_count(self, obj):
        return obj.reports_count

class PostCreateSerializer(serializers.ModelSerializer):
    category_ids = serializers.ListField(
        child=serializers.IntegerField(),
        write_only=True,
        required=False,
        allow_empty=True
    )  
    class Meta:
        model = Post
        fields = ['title', 'content', 'category_ids']
    def validate_title(self, value):
        if len(value) < 5:
            raise serializers.ValidationError("El título debe tener al menos 5 caracteres")
        return value
    def validate_content(self, value):
        if len(value) < 10:
            raise serializers.ValidationError("El contenido debe tener al menos 10 caracteres")
        return value
    def create(self, validated_data):
        category_ids = validated_data.pop('category_ids', [])
        post = Post.objects.create(**validated_data)
        if category_ids:
            categories = Category.objects.filter(id__in=category_ids)
            post.categories.set(categories)
        return post
    

class PostMediaCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = PostMedia
        fields = ['file', 'media_type']

class PostCreateSerializer(serializers.ModelSerializer):
    category_ids = serializers.ListField(
        child=serializers.IntegerField(),
        write_only=True,
        required=False,
        allow_empty=True
    )
    media_files = PostMediaCreateSerializer(many=True, required=False, write_only=True)
    
    class Meta:
        model = Post
        fields = ['title', 'content', 'category_ids', 'media_files']
    
    def create(self, validated_data):
        media_files_data = validated_data.pop('media_files', [])
        category_ids = validated_data.pop('category_ids', [])
        
        post = Post.objects.create(**validated_data)
        for media_data in media_files_data:
            PostMedia.objects.create(post=post, **media_data)

        if category_ids:
            categories = Category.objects.filter(id__in=category_ids)
            post.categories.set(categories)
        
        return post