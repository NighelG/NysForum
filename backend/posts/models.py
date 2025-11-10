from django.db import models
from django.core.validators import MinLengthValidator
from users.models import Profile
from cloudinary.models import CloudinaryField

class Category(models.Model):
    name = models.CharField(max_length=50, unique=True)
    description = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    def __str__(self):
        return self.name

class Post(models.Model):
    profile = models.ForeignKey(Profile, on_delete=models.CASCADE, related_name='posts')
    title = models.CharField(max_length=200, validators=[MinLengthValidator(5)])
    content = models.TextField(validators=[MinLengthValidator(10)])
    categories = models.ManyToManyField(Category, blank=True, related_name='posts')
    is_pinned = models.BooleanField(default=False)
    views_count = models.PositiveIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    def __str__(self):
        return f"{self.title} por {self.profile.user.username}"

class PostMedia(models.Model):
    MEDIA_TYPES = [('image', 'Imagen'), ('video', 'Video'), ('audio', 'Audio')]
    post = models.ForeignKey(Post, on_delete=models.CASCADE, related_name='media_files')
    file = CloudinaryField('media')
    media_type = models.CharField(max_length=10, choices=MEDIA_TYPES)
    uploaded_at = models.DateTimeField(auto_now_add=True)
    def __str__(self):
        return f"{self.media_type} en {self.post.title}"