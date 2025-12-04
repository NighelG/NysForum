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
    resolved_by_info = serializers.SerializerMethodField(read_only=True)
    post_title = serializers.CharField(source='post.title', read_only=True)
    post_author = serializers.CharField(source='post.profile.user.username', read_only=True)
    post_content_preview = serializers.SerializerMethodField(read_only=True)
    class Meta:
        model = ReportPost
        fields = [
            'id', 'reporter', 'post', 
            'post_title', 'post_author', 'post_content_preview',
            'category', 'reason', 'status',
            'resolved_at', 'resolved_by', 'resolved_by_info', 'admin_notes',
            'created_at'
        ]
        read_only_fields = [
            'id', 'reporter', 'status', 'resolved_at', 
            'resolved_by', 'resolved_by_info', 'admin_notes', 'created_at'
        ]
    def get_resolved_by_info(self, obj):
        if obj.resolved_by:
            return {
                'id': obj.resolved_by.id,
                'username': obj.resolved_by.user.username,
                'role': obj.resolved_by.role
            }
        return None
    def get_post_content_preview(self, obj):
        if obj.post and obj.post.content:
            return obj.post.content[:100] + ('...' if len(obj.post.content) > 100 else '')
        return ''
    def validate(self, data):
        post = data.get('post') or self.instance.post if self.instance else None
        reporter = self.context['request'].user.profile
        if post and post.profile == reporter:
            raise serializers.ValidationError({
                'post': 'No puedes reportar tu propio contenido'
            })
        if ReportPost.objects.filter(
            reporter=reporter, 
            post=post
        ).exists():
            raise serializers.ValidationError({
                'post': 'Ya has reportado este post'
            })
        return data

class ReportCommentSerializer(serializers.ModelSerializer):
    reporter = ProfileMinimalSerializer(read_only=True)
    resolved_by_info = serializers.SerializerMethodField(read_only=True)
    comment_content_preview = serializers.SerializerMethodField(read_only=True)
    comment_author = serializers.CharField(source='comment.profile.user.username', read_only=True)
    post_info = serializers.SerializerMethodField(read_only=True)
    class Meta:
        model = ReportComment
        fields = [
            'id', 'reporter', 'comment',
            'comment_content_preview', 'comment_author', 'post_info',
            'category', 'reason', 'status',
            'resolved_at', 'resolved_by', 'resolved_by_info', 'admin_notes',
            'created_at'
        ]
        read_only_fields = [
            'id', 'reporter', 'status', 'resolved_at', 
            'resolved_by', 'resolved_by_info', 'admin_notes', 'created_at'
        ]
    def get_resolved_by_info(self, obj):
        if obj.resolved_by:
            return {
                'id': obj.resolved_by.id,
                'username': obj.resolved_by.user.username,
                'role': obj.resolved_by.role
            }
        return None
    def get_comment_content_preview(self, obj):
        if obj.comment and obj.comment.content:
            return obj.comment.content[:100] + ('...' if len(obj.comment.content) > 100 else '')
        return ''
    def get_post_info(self, obj):
        if obj.comment and obj.comment.post:
            return {
                'id': obj.comment.post.id,
                'title': obj.comment.post.title
            }
        return None
    def validate(self, data):
        comment = data.get('comment') or self.instance.comment if self.instance else None
        reporter = self.context['request'].user.profile
        if comment and comment.profile == reporter:
            raise serializers.ValidationError({
                'comment': 'No puedes reportar tu propio contenido'
            })
        
        if ReportComment.objects.filter(
            reporter=reporter, 
            comment=comment
        ).exists():
            raise serializers.ValidationError({
                'comment': 'Ya has reportado este comentario'
            })
        
        return data

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