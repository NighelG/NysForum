import { apiRequest } from './apiConfig';

export const postService = {
    getPosts: async (categoryId = null) => {
        const url = categoryId ? `/api/posts/?category=${categoryId}` : '/api/posts/';
        return await apiRequest(url);
    },
    getPost: async (postId) => {
        return await apiRequest(`/api/posts/${postId}/`);
    },
    createPost: async (postData) => {
        try {
            console.log('Creando post con datos:', postData);
            const formData = new FormData();
            formData.append('title', postData.title);
            formData.append('content', postData.content);
            if (postData.categories && postData.categories.length > 0) {
                postData.categories.forEach(categoryId => {
                    formData.append('categories', categoryId);
                });
            }
            if (postData.media_files && postData.media_files.length > 0) {
                postData.media_files.forEach((media, index) => {
                    if (media.file instanceof File) {
                        formData.append('media_files', media.file);
                    }
                });
            }
            console.log('FormData preparado, enviando request...');
            return await apiRequest('/api/posts/', {
                method: 'POST',
                body: formData
            });
        } catch (error) {
            console.error('Error en postService.createPost:', error);
            throw error;
        }
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
    }
};