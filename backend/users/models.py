from django.db import models
from django.contrib.auth.models import User

class Profile(models.Model):
    STATUS_CHOICES = [
        ('normal', 'Normal'),
        ('silenciado', 'Silenciado'),
        ('suspendido', 'Suspendido'),
        ('baneado', 'Baneado'),
    ]
    ROLE_CHOICES = [
        ('user', 'Usuario'),
        ('moderator', 'Moderador'),
        ('admin', 'Admin'),
        ('true_admin', 'True Admin'),
    ]
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='user')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='normal')
    avatar = models.ImageField(upload_to='profiles/avatars/', null=True, blank=True)
    bio = models.TextField(max_length=500, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    def __str__(self):
        return f"Perfil de {self.user.username}"