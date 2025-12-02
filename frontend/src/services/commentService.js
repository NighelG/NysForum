import { apiRequest } from './apiConfig.js';

export const commentService = {
    getComments: async () => {
        return await apiRequest('/api/comments/');
    },

    getComment: async (id) => {
        return await apiRequest(`/api/comments/${id}/`);
    },

    createComment: async (commentData) => {
        try {
            if (commentData.media_files && commentData.media_files.length > 0) {
                const formData = new FormData();
                formData.append('post', commentData.post);
                formData.append('content', commentData.content);
                
                if (commentData.parent) {
                    formData.append('parent', commentData.parent);
                }
                commentData.media_files.forEach((media, index) => {
                    if (media.file instanceof File) {
                        formData.append('media_files', media.file);
                    }
                });
                return await apiRequest('/api/comments/', {
                    method: 'POST',
                    body: formData
                });
            } else {
                return await apiRequest('/api/comments/', {
                    method: 'POST',
                    body: JSON.stringify(commentData)
                });
            }
        } catch (error) {
            console.error('Error en commentService.createComment:', error);
            throw error;
        }
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