from django.urls import path
from .views import (
    ModerationActionPostListCreateView, ModerationActionPostDetailView,
    ModerationActionCommentListCreateView, ModerationActionCommentDetailView
)

urlpatterns = [
    # Moderación de posts
    path('posts/', ModerationActionPostListCreateView.as_view(), name='moderation-post-list'),
    path('posts/<int:pk>/', ModerationActionPostDetailView.as_view(), name='moderation-post-detail'),
    # Moderación de comentarios
    path('comments/', ModerationActionCommentListCreateView.as_view(), name='moderation-comment-list'),
    path('comments/<int:pk>/', ModerationActionCommentDetailView.as_view(), name='moderation-comment-detail'),
]
