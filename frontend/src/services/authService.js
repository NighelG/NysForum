import { apiRequest } from './apiConfig.js';
export const authService = {
    login: async (username, password) => {
        const response = await fetch('http://localhost:8000/api/token/', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password }),
        });
        if (!response.ok) {
            let errorMessage = 'Credenciales inválidas';  
            try {
                const errorData = await response.json();
                errorMessage = errorData.detail || errorData.error || errorMessage;
            } catch (jsonError) {
                const textError = await response.text();
                if (textError) {
                    errorMessage = textError;
                }
            }    
            throw new Error(errorMessage);
        }
        return await response.json();
    },
    register: async (userData) => {
        return await apiRequest('/users/register/', {
            method: 'POST',
            body: JSON.stringify(userData)
        });
    },
    getCurrentUser: async () => {
        return await apiRequest('/users/profiles/me/');
    },
    deleteProfile: async () => {
        return await apiRequest('/users/profiles/me/delete/', {
            method: 'POST',
            body: JSON.stringify({ confirmation: true })
        });
    }
};