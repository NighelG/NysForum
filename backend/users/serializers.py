from rest_framework import serializers
from django.contrib.auth.models import User
from django.contrib.auth.password_validation import validate_password
from .models import Profile

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = [
            'id', 'username', 'email', 
            'first_name', 'last_name', 
            'date_joined'
        ]
        read_only_fields = ['id', 'date_joined']

class ProfileSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='user.username', read_only=True)
    email = serializers.EmailField(source='user.email', read_only=True)
    first_name = serializers.CharField(source='user.first_name', read_only=True)
    last_name = serializers.CharField(source='user.last_name', read_only=True)
    date_joined = serializers.DateTimeField(source='user.date_joined', read_only=True)
    posts_count = serializers.SerializerMethodField()
    comments_count = serializers.SerializerMethodField()
    class Meta:
        model = Profile
        fields = [
            'id', 'username', 'email', 'first_name', 'last_name',
            'role', 'status', 'avatar', 'bio',
            'posts_count', 'comments_count',
            'date_joined', 'created_at', 'updated_at'
        ]
        read_only_fields = [
            'id', 'role', 'status', 'created_at', 'updated_at'
        ]
    def get_posts_count(self, obj):
        return obj.posts.count()
    def get_comments_count(self, obj):
        return obj.comments.count()

class ProfileUpdateSerializer(serializers.ModelSerializer):
    first_name = serializers.CharField(source='user.first_name', required=False)
    last_name = serializers.CharField(source='user.last_name', required=False)
    email = serializers.EmailField(source='user.email', required=False)
    class Meta:
        model = Profile
        fields = ['bio', 'first_name', 'last_name', 'email']
    def update(self, instance, validated_data):
        user_data = validated_data.pop('user', {})
        if user_data:
            user = instance.user
            for attr, value in user_data.items():
                setattr(user, attr, value)
            user.save()
        return super().update(instance, validated_data)

class ProfileMinimalSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='user.username', read_only=True)
    class Meta:
        model = Profile
        fields = ['id', 'username', 'avatar', 'role']

class UserRegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(
        write_only=True, 
        min_length=8,
        validators=[validate_password]
    )
    password_confirm = serializers.CharField(write_only=True)
    class Meta:
        model = User
        fields = [
            'username', 'email', 'password', 'password_confirm',
            'first_name', 'last_name'
        ]
    def validate_email(self, value):
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("Este email ya está registrado")
        return value
    def validate_username(self, value):
        if User.objects.filter(username=value).exists():
            raise serializers.ValidationError("Este nombre de usuario ya existe")
        return value
    def validate(self, data):
        if data['password'] != data['password_confirm']:
            raise serializers.ValidationError("Las contraseñas no coinciden")
        return data
    def create(self, validated_data):
        validated_data.pop('password_confirm')
        user = User.objects.create_user(**validated_data)
        Profile.objects.create(user=user)
        return user

class ProfileDeleteSerializer(serializers.Serializer):
    confirmation = serializers.BooleanField(required=True)
    def validate_confirmation(self, value):
        if not value:
            raise serializers.ValidationError("Debe confirmar la eliminación del perfil")
        return value

class AdminProfileDeleteSerializer(serializers.Serializer):
    confirmation = serializers.BooleanField(required=True)
    reason = serializers.CharField(required=False, max_length=500, allow_blank=True)
    def validate_confirmation(self, value):
        if not value:
            raise serializers.ValidationError("Debe confirmar la eliminación del perfil")
        return value
    
class ProfileUpdateSerializer(serializers.ModelSerializer):
    first_name = serializers.CharField(source='user.first_name', required=False)
    last_name = serializers.CharField(source='user.last_name', required=False)
    email = serializers.EmailField(source='user.email', required=False)
    class Meta:
        model = Profile
        fields = ['bio', 'first_name', 'last_name', 'email']
    def update(self, instance, validated_data):
        user_data = validated_data.pop('user', {})
        if user_data:
            user = instance.user
            for attr, value in user_data.items():
                setattr(user, attr, value)
            user.save()
        return super().update(instance, validated_data)
    
class AdminProfileUpdateSerializer(serializers.ModelSerializer):
    first_name = serializers.CharField(source='user.first_name', required=False)
    last_name = serializers.CharField(source='user.last_name', required=False)
    email = serializers.EmailField(source='user.email', required=False)
    role = serializers.ChoiceField(choices=Profile.ROLE_CHOICES, required=False)
    status = serializers.ChoiceField(choices=Profile.STATUS_CHOICES, required=False)
    class Meta:
        model = Profile
        fields = ['bio', 'first_name', 'last_name', 'email', 'role', 'status']
    def update(self, instance, validated_data):
        user_data = validated_data.pop('user', {})
        if user_data:
            user = instance.user
            for attr, value in user_data.items():
                setattr(user, attr, value)
            user.save()
        return super().update(instance, validated_data)