import { apiRequest } from './apiConfig.js';

export const commentService = {
    getComments: async () => {
        return await apiRequest('/comments/');
    },

    getCommentsByPostId: async (postId) => {
        return await apiRequest(`/comments/?post=${postId}`);
    },

    createComment: async (commentData) => {
        return await apiRequest('/comments/', {
            method: 'POST',
            body: JSON.stringify(commentData)
        });
    },

    deleteComment: async (commentId) => {
        return await apiRequest(`/comments/${commentId}/`, {
            method: 'DELETE'
        });
    },

    reactToComment: async (commentId, reactionType) => {
        return await apiRequest('/moderation/reactions/comments/', {
            method: 'POST',
            body: JSON.stringify({
                comment: commentId,
                type: reactionType
            })
        });
    },

    getComment: async (commentId) => {
        return await apiRequest(`/comments/${commentId}/`);
    },

    updateComment: async (commentId, commentData) => {
        return await apiRequest(`/comments/${commentId}/`, {
            method: 'PUT',
            body: JSON.stringify(commentData)
        });
    }
};