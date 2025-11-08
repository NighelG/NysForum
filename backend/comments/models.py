from django.db import models
from django.core.validators import MinLengthValidator
from users.models import Profile
from posts.models import Post
from cloudinary.models import CloudinaryField

class Comment(models.Model):
    post = models.ForeignKey(Post, on_delete=models.CASCADE, related_name='comments')
    profile = models.ForeignKey(Profile, on_delete=models.CASCADE, related_name='comments')
    parent = models.ForeignKey('self', on_delete=models.CASCADE, null=True, blank=True, related_name='replies')
    content = models.TextField(validators=[MinLengthValidator(2)])
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Comentario de {self.profile.user.username}"


class CommentMedia(models.Model):
    MEDIA_TYPES = [('image', 'Imagen'), ('video', 'Video'), ('audio', 'Audio')]
    comment = models.ForeignKey(Comment, on_delete=models.CASCADE, related_name='media_files')
    file = CloudinaryField('media')
    media_type = models.CharField(max_length=10, choices=MEDIA_TYPES)
    uploaded_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.media_type} en comentario {self.comment.id}"