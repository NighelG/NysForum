import { apiRequest } from './apiConfig.js';

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
            body: JSON.stringify({
                title: postData.title,
                content: postData.content,
                category_ids: postData.categoryIds || []
            })
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
    },

    getCategories: async () => {
        return await apiRequest('/posts/categories/');
    }
};