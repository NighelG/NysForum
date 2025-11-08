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

    class Meta:
        model = Post
        fields = [
            'id', 'profile', 'title', 'content', 'categories', 'is_pinned',
            'views_count', 'likes_count', 'dislikes_count', 'comments_count',
            'user_reaction', 'created_at', 'updated_at'
        ]

    def get_likes_count(self, obj):
        return obj.reactions.filter(type='like').count()
    def get_dislikes_count(self, obj):
        return obj.reactions.filter(type='dislike').count()
    def get_comments_count(self, obj):
        return obj.comments.count()
    def get_user_reaction(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            reaction = obj.reactions.filter(profile=request.user.profile).first()
            return reaction.type if reaction else None
        return None

class PostDetailSerializer(serializers.ModelSerializer):
    profile = ProfileMinimalSerializer(read_only=True)
    categories = CategorySerializer(many=True, read_only=True)
    media_files = PostMediaSerializer(many=True, read_only=True)

    class Meta:
        model = Post
        fields = '__all__'

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