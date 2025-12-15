import { useCallback } from 'react';
import { categoryService } from '../services/categoryService';

export const useCategory = (execute, dispatch) => {

    const fetchCategories = useCallback(async () => {
        try {
            dispatch({ type: 'SET_CATEGORY_LOADING', payload: true });
            const data = await execute(() => categoryService.getCategories());
            dispatch({ type: 'SET_CATEGORIES', payload: data });
            return data;
        } catch (error) {
            dispatch({ type: 'SET_CATEGORY_ERROR', payload: error.message });
            throw error;
        } finally {
            dispatch({ type: 'SET_CATEGORY_LOADING', payload: false });
        }
    }, [execute, dispatch]);

    const createCategory = useCallback(async (categoryData) => {
        try {
            dispatch({ type: 'SET_CATEGORY_LOADING', payload: true });
            const response = await execute(() => 
                categoryService.createCategory(categoryData)
            );

            const updatedCategories = await fetchCategories();
            dispatch({ type: 'SET_CATEGORIES', payload: updatedCategories });
            dispatch({ type: 'RESET_CATEGORY_FORM' });
            
            return response;
        } catch (error) {
            dispatch({ type: 'SET_CATEGORY_ERROR', payload: error.message });
            throw error;
        } finally {
            dispatch({ type: 'SET_CATEGORY_LOADING', payload: false });
        }
    }, [execute, dispatch, fetchCategories]);

    const updateCategory = useCallback(async (categoryId, categoryData) => {
        try {
            dispatch({ type: 'SET_CATEGORY_LOADING', payload: true });
            const response = await execute(() => 
                categoryService.updateCategory(categoryId, categoryData)
            );

            const updatedCategories = await fetchCategories();
            dispatch({ type: 'SET_CATEGORIES', payload: updatedCategories });
            dispatch({ type: 'RESET_CATEGORY_FORM' });
            
            return response;
        } catch (error) {
            dispatch({ type: 'SET_CATEGORY_ERROR', payload: error.message });
            throw error;
        } finally {
            dispatch({ type: 'SET_CATEGORY_LOADING', payload: false });
        }
    }, [execute, dispatch, fetchCategories]);

    const deleteCategory = useCallback(async (categoryId) => {
        try {
            dispatch({ type: 'SET_CATEGORY_LOADING', payload: true });
            await execute(() => categoryService.deleteCategory(categoryId));

            const updatedCategories = await fetchCategories();
            dispatch({ type: 'SET_CATEGORIES', payload: updatedCategories });
            
            return true;
        } catch (error) {
            dispatch({ type: 'SET_CATEGORY_ERROR', payload: error.message });
            throw error;
        } finally {
            dispatch({ type: 'SET_CATEGORY_LOADING', payload: false });
        }
    }, [execute, dispatch, fetchCategories]);

    const startEditCategory = useCallback((category) => {
        dispatch({ 
            type: 'SET_CATEGORY_FORM', 
            payload: {
                id: category.id,
                name: category.name,
                description: category.description || '',
                isEditing: true
            }
        });
    }, [dispatch]);

    const cancelForm = useCallback(() => {
        dispatch({ type: 'RESET_CATEGORY_FORM' });
    }, [dispatch]);

    return {
        fetchCategories,
        createCategory,
        updateCategory,
        deleteCategory,
        startEditCategory,
        cancelForm
    };
}; 