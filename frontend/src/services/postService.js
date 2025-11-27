import { apiRequest } from './apiConfig.js';

export const postService = {
    getPosts: async (categoryId = null) => {
        const url = categoryId ? `/api/posts/?category=${categoryId}` : '/api/posts/';
        return await apiRequest(url);
    },

    getPost: async (postId) => {
        return await apiRequest(`/api/posts/${postId}/`);
    },

    createPost: async (postData) => {
        return await apiRequest('/api/posts/', {
            method: 'POST',
            body: JSON.stringify({
                title: postData.title,
                content: postData.content,
                categories: postData.categories || [],
                media_files: postData.mediaFiles || []
            })
        });
    },

    updatePost: async (postId, postData) => {
        return await apiRequest(`/api/posts/${postId}/`, {
            method: 'PATCH',
            body: JSON.stringify({
                ...postData,
                categories: postData.categoryIds || postData.categories
            })
        });
    },

    deletePost: async (postId) => {
        return await apiRequest(`/api/posts/${postId}/`, {
            method: 'DELETE'
        });
    },

    reactToPost: async (postId, reactionType) => {
        return await apiRequest('/api/moderation/reactions/posts/', {
            method: 'POST',
            body: JSON.stringify({
                post: postId,
                type: reactionType
            })
        });
    },

    getCategories: async () => {
        return await apiRequest('/api/posts/categories/');
    },

    uploadMedia: async (postId, file, mediaType) => {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('media_type', mediaType);
        formData.append('post', postId);
        return await apiRequest('/api/posts/media/', {
            method: 'POST',
            body: formData,
        });
    },

    searchPosts: async (query) => {
        return await apiRequest(`/api/posts/?search=${encodeURIComponent(query)}`);
    },

    getPostsByUserId: async (userId) => {
        return await apiRequest(`/api/posts/?user_id=${userId}`);
    },

    incrementView: async (postId) => {
        return await apiRequest(`/api/posts/${postId}/increment-view/`, {
            method: 'POST'
        });
    },

};