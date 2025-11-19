from rest_framework import serializers
from .models import Comment, CommentMedia
from users.serializers import ProfileMinimalSerializer

class CommentMediaSerializer(serializers.ModelSerializer):
    class Meta:
        model = CommentMedia
        fields = ['id', 'file', 'media_type', 'uploaded_at']
        read_only_fields = ['id', 'uploaded_at']

class CommentReplySerializer(serializers.ModelSerializer):
    profile = ProfileMinimalSerializer(read_only=True)
    media_files = CommentMediaSerializer(many=True, read_only=True)
    likes_count = serializers.ReadOnlyField()
    dislikes_count = serializers.ReadOnlyField()
    user_reaction = serializers.SerializerMethodField()
    class Meta:
        model = Comment
        fields = [
            'id', 'profile', 'content', 'media_files',
            'likes_count', 'dislikes_count', 'user_reaction',
            'created_at'
        ]
    def get_user_reaction(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated and hasattr(request.user, 'profile'):
            try:
                from moderation.models import ReactionComment
                reaction = ReactionComment.objects.filter(
                    comment=obj,
                    profile=request.user.profile
                ).first()
                return reaction.type if reaction else None
            except Exception as e:
                print(f"Error en get_user_reaction para comment {obj.id}: {e}")
        return None

class CommentSerializer(serializers.ModelSerializer):
    profile = ProfileMinimalSerializer(read_only=True)
    media_files = CommentMediaSerializer(many=True, read_only=True)
    likes_count = serializers.ReadOnlyField()
    dislikes_count = serializers.ReadOnlyField()
    replies = CommentReplySerializer(many=True, read_only=True)
    replies_count = serializers.SerializerMethodField()
    reports_count = serializers.ReadOnlyField()
    user_reaction = serializers.SerializerMethodField()
    class Meta:
        model = Comment
        fields = [
            'id', 'post', 'profile', 'parent', 'content', 'media_files',
            'likes_count', 'dislikes_count', 'replies', 'replies_count',
            'reports_count', 'user_reaction', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'profile', 'created_at', 'updated_at']
    def get_replies_count(self, obj):
        return obj.replies.count()  
    def get_user_reaction(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated and hasattr(request.user, 'profile'):
            try:
                from moderation.models import ReactionComment
                reaction = ReactionComment.objects.filter(
                    comment=obj,
                    profile=request.user.profile
                ).first()
                return reaction.type if reaction else None
            except Exception as e:
                print(f"Error en get_user_reaction para comment {obj.id}: {e}")
        return None