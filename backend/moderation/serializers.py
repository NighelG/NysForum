from rest_framework import serializers
from .models import (
    ReactionPost, ReactionComment, Notification,
    ReportPost, ReportComment,
    ModerationActionPost, ModerationActionComment
)
from users.serializers import ProfileMinimalSerializer

class ReactionPostSerializer(serializers.ModelSerializer):
    profile = ProfileMinimalSerializer(read_only=True)
    class Meta:
        model = ReactionPost
        fields = ['id', 'post', 'profile', 'type', 'created_at']
        read_only_fields = ['id', 'profile', 'created_at']

class ReactionCommentSerializer(serializers.ModelSerializer):
    profile = ProfileMinimalSerializer(read_only=True)
    class Meta:
        model = ReactionComment
        fields = ['id', 'comment', 'profile', 'type', 'created_at']
        read_only_fields = ['id', 'profile', 'created_at']

class NotificationSerializer(serializers.ModelSerializer):
    recipient = ProfileMinimalSerializer(read_only=True)  
    class Meta:
        model = Notification
        fields = ['id', 'recipient', 'message', 'is_read', 'created_at']
        read_only_fields = ['id', 'recipient', 'created_at']

class ReportPostSerializer(serializers.ModelSerializer):
    reporter = ProfileMinimalSerializer(read_only=True)
    post_title = serializers.CharField(source='post.title', read_only=True)
    post_author = serializers.CharField(source='post.profile.user.username', read_only=True)
    class Meta:
        model = ReportPost
        fields = ['id', 'reporter', 'post', 'post_title', 'post_author', 'reason', 'created_at']
        read_only_fields = ['id', 'reporter', 'created_at']

class ReportCommentSerializer(serializers.ModelSerializer):
    reporter = ProfileMinimalSerializer(read_only=True)
    comment_content = serializers.CharField(source='comment.content', read_only=True)
    comment_author = serializers.CharField(source='comment.profile.user.username', read_only=True)
    class Meta:
        model = ReportComment
        fields = ['id', 'reporter', 'comment', 'comment_content', 'comment_author', 'reason', 'created_at']
        read_only_fields = ['id', 'reporter', 'created_at']

class ModerationActionPostSerializer(serializers.ModelSerializer):
    moderator_username = serializers.CharField(source='moderator.user.username', read_only=True)
    post_title = serializers.CharField(source='target_post.title', read_only=True)
    post_author = serializers.CharField(source='target_post.profile.user.username', read_only=True)
    class Meta:
        model = ModerationActionPost
        fields = [
            'id', 'moderator', 'moderator_username', 'target_post', 'post_title', 
            'post_author', 'action', 'reason', 'created_at'
        ]
        read_only_fields = ['id', 'moderator', 'created_at']

class ModerationActionCommentSerializer(serializers.ModelSerializer):
    moderator_username = serializers.CharField(source='moderator.user.username', read_only=True)
    comment_content = serializers.CharField(source='target_comment.content', read_only=True)
    comment_author = serializers.CharField(source='target_comment.profile.user.username', read_only=True)
    class Meta:
        model = ModerationActionComment
        fields = [
            'id', 'moderator', 'moderator_username', 'target_comment', 'comment_content',
            'comment_author', 'action', 'reason', 'created_at'
        ]
        read_only_fields = ['id', 'moderator', 'created_at']