import { apiRequest, apiFileUpload } from './apiConfig.js';

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
        const registrationData = {
            username: userData.username,
            email: userData.email,
            password: userData.password,
            password_confirm: userData.password_confirm,
            first_name: userData.first_name || "",
            last_name: userData.last_name || ""
        };
        console.log('Intentando registrar usuario:', registrationData);
        return await apiRequest('/users/register/', {
            method: 'POST',
            body: JSON.stringify(registrationData)
        });
    },
    
    getCurrentUser: async () => {
        return await apiRequest('/users/profiles/me/');
    },
    
    updateAccount: async (accountData) => {
        return await apiRequest('/users/profiles/me/', {
            method: 'PATCH',
            body: JSON.stringify(accountData)
        });
    },

    deleteProfile: async () => {
        return await apiRequest('/users/profiles/me/delete/', {
            method: 'POST',
            body: JSON.stringify({ confirmation: true })
        });
    },

    updateAvatar: async (avatarFile) => {
        const formData = new FormData();
        formData.append('avatar', avatarFile);
        
        return await apiFileUpload('/users/profiles/me/avatar/', formData);
    }
};