import { apiRequest } from './apiConfig';

export const commentService = {
    getComments: async () => {
        return await apiRequest('/comments/');
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
    }
};