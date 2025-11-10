from django.shortcuts import render

from rest_framework import generics, permissions
from .models import ModerationActionPost, ModerationActionComment
from .serializers import ModerationActionPostSerializer, ModerationActionCommentSerializer

class ModerationActionPostListCreateView(generics.ListCreateAPIView):
    queryset = ModerationActionPost.objects.all()
    serializer_class = ModerationActionPostSerializer
    permission_classes = [permissions.IsAuthenticated]

class ModerationActionPostDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = ModerationActionPost.objects.all()
    serializer_class = ModerationActionPostSerializer
    permission_classes = [permissions.IsAuthenticated]

class ModerationActionCommentListCreateView(generics.ListCreateAPIView):
    queryset = ModerationActionComment.objects.all()
    serializer_class = ModerationActionCommentSerializer
    permission_classes = [permissions.IsAuthenticated]

class ModerationActionCommentDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = ModerationActionComment.objects.all()
    serializer_class = ModerationActionCommentSerializer
    permission_classes = [permissions.IsAuthenticated]

