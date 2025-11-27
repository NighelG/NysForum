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
    @property
    def likes_count(self):
        return self.reactions.filter(type='like').count()
    @property
    def dislikes_count(self):
        return self.reactions.filter(type='dislike').count()
    @property
    def reports_count(self):
        return self.reports.count()
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
    
class PostView(models.Model):
    post = models.ForeignKey(Post, on_delete=models.CASCADE, related_name='post_views')
    profile = models.ForeignKey(Profile, on_delete=models.CASCADE)
    viewed_at = models.DateTimeField(auto_now_add=True)
    class Meta:
        unique_together = ['post', 'profile']
        indexes = [
            models.Index(fields=['post', 'profile']),
        ]
    def __str__(self):
        return f"{self.profile.user.username} viewed {self.post.title}"