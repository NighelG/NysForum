from django.urls import path
from .views import CommentListCreateView, CommentDetailView, CommentMediaGetView

urlpatterns = [
    path('', CommentListCreateView.as_view(), name='comment-list-create'),
    path('<int:pk>/', CommentDetailView.as_view(), name='comment-detail'),
    path('media/<str:file_id>/', CommentMediaGetView.as_view(), name='comment-media-get'),
]