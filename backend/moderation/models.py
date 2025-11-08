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
    reporter = models.ForeignKey(Profile, on_delete=models.CASCADE)
    post = models.ForeignKey(Post, on_delete=models.CASCADE)
    reason = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

class ReportComment(models.Model):
    reporter = models.ForeignKey(Profile, on_delete=models.CASCADE)
    comment = models.ForeignKey(Comment, on_delete=models.CASCADE)
    reason = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

class ModerationActionPost(models.Model):
    moderator = models.ForeignKey(User, on_delete=models.CASCADE)
    target_post = models.ForeignKey(Post, on_delete=models.CASCADE)
    action = models.CharField(max_length=20)
    created_at = models.DateTimeField(auto_now_add=True)

class ModerationActionComment(models.Model):
    moderator = models.ForeignKey(User, on_delete=models.CASCADE)
    target_comment = models.ForeignKey(Comment, on_delete=models.CASCADE)
    action = models.CharField(max_length=20)
    created_at = models.DateTimeField(auto_now_add=True)