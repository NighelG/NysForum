// Configuración base para todas las llamadas al backend
const API_BASE_URL = 'http://localhost:8000/api';

export const getAuthHeaders = () => {
    const token = localStorage.getItem('authToken');
    return {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
    };
};

export const apiRequest = async (endpoint, options = {}) => {
    const url = `${API_BASE_URL}${endpoint}`;
    const config = {
        headers: getAuthHeaders(),
        ...options
    };
    try {
        const response = await fetch(url, config);
        if (response.status === 204) {
            return null;
        }
        if (!response.ok) {
            let errorMessage = `Error ${response.status}`;       
            try {
                const errorData = await response.json();
                errorMessage = errorData.error || errorData.detail || errorData.message || errorMessage;
            } catch (jsonError) {
                const textError = await response.text();
                if (textError) {
                    errorMessage = textError;
                }
            }  
            throw new Error(errorMessage);
        }
        return await response.json();
    } catch (error) {
        if (error.name === 'TypeError' && error.message.includes('Failed to fetch')) {
            throw new Error('Error de conexión. Verifica que el servidor esté ejecutándose.');
        }
        throw error;
    }
};