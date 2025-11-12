// Configuración base para todas las llamadas al backend
const API_BASE_URL = 'http://localhost:8000/api';

export const getAuthHeaders = () => {
    const token = localStorage.getItem('authToken');
    const headers = {
        'Content-Type': 'application/json'
    };
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
};

export const getPublicHeaders = () => ({
    'Content-Type': 'application/json'
});

export const apiRequest = async (endpoint, options = {}) => {
    const url = `${API_BASE_URL}${endpoint}`;

    const isPublicEndpoint = endpoint.includes('/register/') || endpoint.includes('/token/');
    const baseHeaders = isPublicEndpoint ? getPublicHeaders() : getAuthHeaders();
    const config = {
        headers: {
            ...baseHeaders,
            ...options.headers
        },
        ...options
    };
    try {
        console.log(`Haciendo petición a: ${url}`);
        console.log(`Datos enviados:`, options.body);
        const response = await fetch(url, config);
        console.log(`Status de respuesta: ${response.status}`);
        console.log(`URL de respuesta: ${response.url}`);
        if (response.status === 204) {
            return null;
        }
        const responseText = await response.text();
        console.log(`Respuesta cruda:`, responseText);
        if (!response.ok) {
            let errorMessage = `Error ${response.status}: ${response.statusText}`;    
            try {
                const errorData = JSON.parse(responseText);
                errorMessage = errorData.error || errorData.detail || errorData.message || errorMessage;
                if (errorData.username) {
                    errorMessage = `Usuario: ${Array.isArray(errorData.username) ? errorData.username.join(', ') : errorData.username}`;
                }
                if (errorData.email) {
                    errorMessage = `Email: ${Array.isArray(errorData.email) ? errorData.email.join(', ') : errorData.email}`;
                }
                if (errorData.password) {
                    errorMessage = `Contraseña: ${Array.isArray(errorData.password) ? errorData.password.join(', ') : errorData.password}`;
                }
                if (errorData.non_field_errors) {
                    errorMessage = Array.isArray(errorData.non_field_errors) ? errorData.non_field_errors.join(', ') : errorData.non_field_errors;
                }
            } catch (jsonError) {
                if (responseText) {
                    errorMessage = responseText;
                }
            }
            throw new Error(errorMessage);
        }
        
        const result = responseText ? JSON.parse(responseText) : {};
        console.log(' Respuesta exitosa:', result);
        return result;
        
    } catch (error) {
        console.error('Error en petición API:', error);
        if (error.name === 'TypeError' && error.message.includes('Failed to fetch')) {
            throw new Error('Error de conexión. Verifica que el servidor Django esté ejecutándose en http://localhost:8000');
        }
        throw error;
    }
};