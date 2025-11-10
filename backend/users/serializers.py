from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Profile

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'date_joined']
        read_only_fields = ['id', 'date_joined']

class ProfileSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='user.username', read_only=True)
    email = serializers.EmailField(source='user.email', read_only=True)
    date_joined = serializers.DateTimeField(source='user.date_joined', read_only=True)
    posts_count = serializers.SerializerMethodField()
    comments_count = serializers.SerializerMethodField()
    class Meta:
        model = Profile
        fields = [
            'id', 'username', 'email', 'role', 'status', 'avatar', 'bio',
            'posts_count', 'comments_count', 'date_joined', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'role', 'status', 'created_at', 'updated_at']
    def get_posts_count(self, obj):
        return obj.posts.count()
    def get_comments_count(self, obj):
        return obj.comments.count()

class ProfileUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Profile
        fields = ['avatar', 'bio']

class ProfileMinimalSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='user.username', read_only=True)
    class Meta:
        model = Profile
        fields = ['id', 'username', 'avatar', 'role']

class UserRegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)
    password_confirm = serializers.CharField(write_only=True)
    class Meta:
        model = User
        fields = ['username', 'email', 'password', 'password_confirm', 'first_name', 'last_name']
    def validate(self, data):
        if data['password'] != data['password_confirm']:
            raise serializers.ValidationError("Las contraseñas no coinciden")
        return data
    def create(self, validated_data):
        validated_data.pop('password_confirm')
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=validated_data['password'],
            first_name=validated_data.get('first_name', ''),
            last_name=validated_data.get('last_name', '')
        )
        return user
    
class ProfileDeleteSerializer(serializers.Serializer):
    confirmation = serializers.BooleanField(
        required=True,
        help_text="Debe confirmar la eliminación"
    )
    def validate_confirmation(self, value):
        if not value:
            raise serializers.ValidationError("Debe confirmar la eliminación del perfil")
        return value

class AdminProfileDeleteSerializer(serializers.Serializer):
    confirmation = serializers.BooleanField(required=True)
    reason = serializers.CharField(
        required=False, 
        max_length=500,
        help_text="Razón opcional para la eliminación por parte del admin"
    )
    def validate_confirmation(self, value):
        if not value:
            raise serializers.ValidationError("Debe confirmar la eliminación del perfil")
        return value