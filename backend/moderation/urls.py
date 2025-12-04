from django.urls import path
from .views import (
    ReactionPostListCreateView, ReactionCommentListCreateView,
    NotificationListView, NotificationMarkAsReadView,
    ReportPostCreateView, ReportCommentCreateView,
    ModerationActionPostListCreateView, ModerationActionPostDetailView,
    ModerationActionCommentListCreateView, ModerationActionCommentDetailView,
    UnifiedReportsListView,
    ResolveReportView,
    ReportStatsView
)

urlpatterns = [
    #Reacciones
    path('reactions/posts/', ReactionPostListCreateView.as_view(), name='reaction-post-list'),
    path('reactions/comments/', ReactionCommentListCreateView.as_view(), name='reaction-comment-list'),
    
    #Notificaciones
    path('notifications/', NotificationListView.as_view(), name='notification-list'),
    path('notifications/mark-read/', NotificationMarkAsReadView.as_view(), name='notification-mark-all-read'),
    path('notifications/<int:pk>/mark-read/', NotificationMarkAsReadView.as_view(), name='notification-mark-read'),
    
    #Reports
    path('reports/posts/', ReportPostCreateView.as_view(), name='report-post-create'),
    path('reports/comments/', ReportCommentCreateView.as_view(), name='report-comment-create'),
    
    #Acciones
    path('actions/posts/', ModerationActionPostListCreateView.as_view(), name='moderation-post-list'),
    path('actions/posts/<int:pk>/', ModerationActionPostDetailView.as_view(), name='moderation-post-detail'),
    path('actions/comments/', ModerationActionCommentListCreateView.as_view(), name='moderation-comment-list'),
    path('actions/comments/<int:pk>/', ModerationActionCommentDetailView.as_view(), name='moderation-comment-detail'),
    
    path('reports/all/', UnifiedReportsListView.as_view(), name='reports-all'),
    path('reports/stats/', ReportStatsView.as_view(), name='reports-stats'),
    path('reports/<str:report_type>/<int:report_id>/resolve/', 
        ResolveReportView.as_view(), name='resolve-report'),
]