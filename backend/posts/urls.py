from django.urls import path
from .views import (
    CategoryListCreateView, CategoryDetailView,
    PostListCreateView, PostDetailView, PostIncrementView,
    PostMediaGetView
)

urlpatterns = [
    path('categories/', CategoryListCreateView.as_view(), name='category-list'),
    path('categories/<int:pk>/', CategoryDetailView.as_view(), name='category-detail'),
    path('', PostListCreateView.as_view(), name='post-list'),
    path('<int:pk>/', PostDetailView.as_view(), name='post-detail'),
    path('<int:pk>/increment-view/', PostIncrementView.as_view(), name='post-increment-view'),
    path('media/<str:file_id>/', PostMediaGetView.as_view(), name='post-media-get'),
]