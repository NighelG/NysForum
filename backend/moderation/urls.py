from django.urls import path
from .views import (
    # Reactions
    ReactionPostListCreateView, ReactionCommentListCreateView,
    # Notificaciones
    NotificationListView, NotificationMarkAsReadView,
    # Reports
    ReportPostCreateView, ReportCommentCreateView,
    # Moderation Actions
    ModerationActionPostListCreateView, ModerationActionPostDetailView,
    ModerationActionCommentListCreateView, ModerationActionCommentDetailView
)

urlpatterns = [
    # Reactions
    path('reactions/posts/', ReactionPostListCreateView.as_view(), name='reaction-post-list'),
    path('reactions/comments/', ReactionCommentListCreateView.as_view(), name='reaction-comment-list'),
    # Notificaciones
    path('notifications/', NotificationListView.as_view(), name='notification-list'),
    path('notifications/mark-read/', NotificationMarkAsReadView.as_view(), name='notification-mark-all-read'),
    path('notifications/<int:pk>/mark-read/', NotificationMarkAsReadView.as_view(), name='notification-mark-read'),
    # Reports
    path('reports/posts/', ReportPostCreateView.as_view(), name='report-post-create'),
    path('reports/comments/', ReportCommentCreateView.as_view(), name='report-comment-create'),
    # Moderation Actions
    path('actions/posts/', ModerationActionPostListCreateView.as_view(), name='moderation-post-list'),
    path('actions/posts/<int:pk>/', ModerationActionPostDetailView.as_view(), name='moderation-post-detail'),
    path('actions/comments/', ModerationActionCommentListCreateView.as_view(), name='moderation-comment-list'),
    path('actions/comments/<int:pk>/', ModerationActionCommentDetailView.as_view(), name='moderation-comment-detail'),
]