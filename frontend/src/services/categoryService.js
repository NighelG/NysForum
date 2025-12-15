import { apiRequest } from './apiConfig';

export const categoryService = {
    getCategories: async () => {
        return await apiRequest('/api/posts/categories/');
    },

    createCategory: async (categoryData) => {
        return await apiRequest('/api/posts/categories/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(categoryData)
        });
    },
    
    updateCategory: async (categoryId, categoryData) => {
        return await apiRequest(`/api/posts/categories/${categoryId}/`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(categoryData)
        });
    },

    deleteCategory: async (categoryId) => {
        return await apiRequest(`/api/posts/categories/${categoryId}/`, {
            method: 'DELETE'
        });
    }
};