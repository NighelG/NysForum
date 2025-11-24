import { apiRequest } from './apiConfig.js';

export const postService = {
    getPosts: async (categoryId = null) => {
        const url = categoryId ? `/posts/?category=${categoryId}` : '/posts/';
        return await apiRequest(url);
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
                categories: postData.categories || [],
                media_files: postData.mediaFiles || []
            })
        });
    },

    updatePost: async (postId, postData) => {
        return await apiRequest(`/posts/${postId}/`, {
            method: 'PATCH',
            body: JSON.stringify({
                ...postData,
                categories: postData.categoryIds || postData.categories
            })
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
    },

    uploadMedia: async (postId, file, mediaType) => {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('media_type', mediaType);
        formData.append('post', postId);
        return await apiRequest('/posts/media/', {
            method: 'POST',
            body: formData,
        });
    },
    searchPosts: async (query) => {
        return await apiRequest(`/posts/?search=${encodeURIComponent(query)}`);
    }
};