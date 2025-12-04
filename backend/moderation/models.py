from django.db import models
from django.contrib.auth.models import User
from users.models import Profile
from posts.models import Post
from comments.models import Comment

class ReactionPost(models.Model):
    post = models.ForeignKey(Post, on_delete=models.CASCADE, related_name='reactions')
    profile = models.ForeignKey(Profile, on_delete=models.CASCADE, related_name='post_reactions')
    type = models.CharField(max_length=10, choices=[('like', 'Like'), ('dislike', 'Dislike')])
    created_at = models.DateTimeField(auto_now_add=True)  
    class Meta:
        unique_together = ['post', 'profile']

class ReactionComment(models.Model):
    comment = models.ForeignKey(Comment, on_delete=models.CASCADE, related_name='reactions')
    profile = models.ForeignKey(Profile, on_delete=models.CASCADE, related_name='comment_reactions')
    type = models.CharField(max_length=10, choices=[('like', 'Like'), ('dislike', 'Dislike')])
    created_at = models.DateTimeField(auto_now_add=True)  
    class Meta:
        unique_together = ['comment', 'profile']

class Notification(models.Model):
    recipient = models.ForeignKey(Profile, on_delete=models.CASCADE, related_name='notifications')
    message = models.TextField()
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True) 
    def __str__(self):
        return f"Notif para {self.recipient.user.username}"

class ReportPost(models.Model):
    reporter = models.ForeignKey(Profile, on_delete=models.CASCADE, related_name='post_reports')
    post = models.ForeignKey(Post, on_delete=models.CASCADE, related_name='reports')
    STATUS_CHOICES = [
        ('pending', 'Pendiente'),
        ('reviewed', 'Revisado'),
        ('resolved', 'Resuelto'),
        ('dismissed', 'Desestimado')
    ]
    status = models.CharField(
        max_length=20, 
        choices=STATUS_CHOICES, 
        default='pending'
    )
    CATEGORY_CHOICES = [
        ('spam', 'Spam'),
        ('harassment', 'Acoso'),
        ('inappropriate', 'Contenido inapropiado'),
        ('misinformation', 'Información falsa'),
        ('other', 'Otro')
    ]
    category = models.CharField(
        max_length=50, 
        choices=CATEGORY_CHOICES, 
        default='other'
    )
    reason = models.TextField()
    resolved_at = models.DateTimeField(null=True, blank=True)
    resolved_by = models.ForeignKey(
        Profile, 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True,
        related_name='resolved_post_reports'
    )
    admin_notes = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    class Meta:
        unique_together = ['reporter', 'post']
    def __str__(self):
        return f"Reporte #{self.id} - Post {self.post.id} ({self.status})"

class ReportComment(models.Model):
    reporter = models.ForeignKey(Profile, on_delete=models.CASCADE, related_name='comment_reports')
    comment = models.ForeignKey(Comment, on_delete=models.CASCADE, related_name='reports')
    STATUS_CHOICES = [
        ('pending', 'Pendiente'),
        ('reviewed', 'Revisado'),
        ('resolved', 'Resuelto'),
        ('dismissed', 'Desestimado')
    ]
    status = models.CharField(
        max_length=20, 
        choices=STATUS_CHOICES, 
        default='pending'
    )
    CATEGORY_CHOICES = [
        ('spam', 'Spam'),
        ('harassment', 'Acoso'),
        ('inappropriate', 'Contenido inapropiado'),
        ('misinformation', 'Información falsa'),
        ('other', 'Otro')
    ]
    category = models.CharField(
        max_length=50, 
        choices=CATEGORY_CHOICES, 
        default='other'
    )
    reason = models.TextField()
    resolved_at = models.DateTimeField(null=True, blank=True)
    resolved_by = models.ForeignKey(
        Profile, 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True,
        related_name='resolved_comment_reports'
    )
    admin_notes = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    class Meta:
        unique_together = ['reporter', 'comment']
    def __str__(self):
        return f"Reporte #{self.id} - Comment {self.comment.id} ({self.status})"

class ModerationActionPost(models.Model):
    moderator = models.ForeignKey(Profile, on_delete=models.CASCADE, related_name='post_moderation_actions')
    target_post = models.ForeignKey(Post, on_delete=models.CASCADE, related_name='moderation_actions')
    action = models.CharField(max_length=20, choices=[
        ('delete', 'Eliminar'), ('hide', 'Ocultar'), ('warn', 'Advertencia'), 
        ('approve', 'Aprobar'), ('pin', 'Fijar'), ('unpin', 'Desfijar')
    ])
    reason = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True) 
    def __str__(self):
        return f"{self.action} en post {self.target_post.id}"

class ModerationActionComment(models.Model):
    moderator = models.ForeignKey(Profile, on_delete=models.CASCADE, related_name='comment_moderation_actions')
    target_comment = models.ForeignKey(Comment, on_delete=models.CASCADE, related_name='moderation_actions')
    action = models.CharField(max_length=20, choices=[
        ('delete', 'Eliminar'), ('hide', 'Ocultar'), ('warn', 'Advertencia'), 
        ('approve', 'Aprobar')
    ])
    reason = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    def __str__(self):
        return f"{self.action} en comentario {self.target_comment.id}"