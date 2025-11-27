import { apiRequest } from './apiConfig.js';

export const commentService = {
    getComments: async () => {
        return await apiRequest('/api/comments/');
    },

    getComment: async (id) => {
        return await apiRequest(`/api/comments/${id}/`);
    },

    createComment: async (commentData) => {
        return await apiRequest('/api/comments/', {
            method: 'POST',
            body: JSON.stringify(commentData)
        });
    },

    updateComment: async (id, commentData) => {
        return await apiRequest(`/api/comments/${id}/`, {
            method: 'PUT',
            body: JSON.stringify(commentData)
        });
    },

    deleteComment: async (id) => {
        return await apiRequest(`/api/comments/${id}/`, {
            method: 'DELETE'
        });
    },

    reactToComment: async (commentId, reactionType) => {
        return await apiRequest('/api/moderation/reactions/comments/', {
            method: 'POST',
            body: JSON.stringify({
                comment: commentId,
                type: reactionType
            })
        });
    },

    getCommentsByUserId: async (userId) => {
        return await apiRequest(`/api/comments/?user_id=${userId}`);
    },
}