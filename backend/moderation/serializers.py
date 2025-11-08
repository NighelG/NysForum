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
    class Meta:
        model = ReportPost
        fields = ['id', 'reporter', 'post', 'post_title', 'reason', 'created_at']
        read_only_fields = ['id', 'reporter', 'created_at']

class ReportCommentSerializer(serializers.ModelSerializer):
    reporter = ProfileMinimalSerializer(read_only=True)
    comment_content = serializers.CharField(source='comment.content', read_only=True)
    class Meta:
        model = ReportComment
        fields = ['id', 'reporter', 'comment', 'comment_content', 'reason', 'created_at']
        read_only_fields = ['id', 'reporter', 'created_at']

class ModerationActionPostSerializer(serializers.ModelSerializer):
    moderator_username = serializers.CharField(source='moderator.username', read_only=True)
    post_title = serializers.CharField(source='target_post.title', read_only=True)
    class Meta:
        model = ModerationActionPost
        fields = ['id', 'moderator', 'moderator_username', 'target_post', 'post_title', 'action', 'created_at']
        read_only_fields = ['id', 'moderator', 'created_at']

class ModerationActionCommentSerializer(serializers.ModelSerializer):
    moderator_username = serializers.CharField(source='moderator.username', read_only=True)
    comment_content = serializers.CharField(source='target_comment.content', read_only=True)
    class Meta:
        model = ModerationActionComment
        fields = ['id', 'moderator', 'moderator_username', 'target_comment', 'comment_content', 'action', 'created_at']
        read_only_fields = ['id', 'moderator', 'created_at']
