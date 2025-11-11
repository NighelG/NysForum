import { apiRequest, getAuthHeaders } from './apiConfig';

    export const authService = {
    // Login con JWT
    login: async (username, password) => {
            const response = await fetch('http://localhost:8000/api/token/', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password }),
        });
        
        if (!response.ok) throw new Error('Credenciales inválidas');
        return await response.json();
    },

    // Registro de usuario
    register: async (userData) => {
            return await apiRequest('/users/register/', {
            method: 'POST',
            body: JSON.stringify(userData)
        });
    },

    // Obtener perfil actual
    getCurrentUser: async () => {
        return await apiRequest('/users/profiles/me/');
    },

    // Eliminar perfil
    deleteProfile: async () => {
            return await apiRequest('/users/profiles/me/delete/', {
            method: 'POST',
            body: JSON.stringify({ confirmation: true })
        });
    }
};