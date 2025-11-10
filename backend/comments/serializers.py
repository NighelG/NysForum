from rest_framework import serializers
from .models import Comment, CommentMedia
from users.serializers import ProfileMinimalSerializer

class CommentMediaSerializer(serializers.ModelSerializer):
    class Meta:
        model = CommentMedia
        fields = ['id', 'file', 'media_type', 'uploaded_at']
        read_only_fields = ['id', 'uploaded_at']

class CommentSerializer(serializers.ModelSerializer):
    profile = ProfileMinimalSerializer(read_only=True)
    media_files = CommentMediaSerializer(many=True, read_only=True)
    likes_count = serializers.SerializerMethodField()
    dislikes_count = serializers.SerializerMethodField()
    replies = serializers.SerializerMethodField()
    replies_count = serializers.SerializerMethodField()
    class Meta:
        model = Comment
        fields = [
            'id', 'post', 'profile', 'parent', 'content', 'media_files',
            'likes_count', 'dislikes_count', 'replies', 'replies_count',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'profile', 'created_at', 'updated_at']

    def get_likes_count(self, obj):
        return obj.reactions.filter(type='like').count()
    def get_dislikes_count(self, obj):
        return obj.reactions.filter(type='dislike').count()
    def get_replies(self, obj):
        if obj.parent is None:
            replies = obj.replies.all()
            return CommentSerializer(replies, many=True, context=self.context).data
        return []
    def get_replies_count(self, obj):
        return obj.replies.count()
