import { apiRequest } from './apiConfig';

export const postService = {
    getPosts: async () => {
        return await apiRequest('/posts/');
    },
    getPost: async (postId) => {
        return await apiRequest(`/posts/${postId}/`);
    },
    createPost: async (postData) => {
        return await apiRequest('/posts/', {
            method: 'POST',
            body: JSON.stringify(postData)
        });
    },

    updatePost: async (postId, postData) => {
        return await apiRequest(`/posts/${postId}/`, {
            method: 'PUT',
            body: JSON.stringify(postData)
        });
    },

    deletePost: async (postId) => {
        return await apiRequest(`/posts/${postId}/`, {
            method: 'DELETE'
        });
    },

    reactToPost: async (postId, reactionType) => {
        return await apiRequest('/moderation/reactions/posts/', {
            method: 'POST',
            body: JSON.stringify({
                post: postId,
                type: reactionType
            })
        });
    }
};