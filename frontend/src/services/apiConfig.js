// Configuración base para todas las llamadas al backend
const API_BASE_URL = 'http://localhost:8000';

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

export const getFormDataHeaders = () => {
    const token = localStorage.getItem('authToken');
    const headers = {};
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
};

export const apiFileUpload = async (endpoint, formData) => {
    const token = localStorage.getItem('authToken');
    const url = `${API_BASE_URL}${endpoint}`;

    try {
        const response = await fetch(url, {
            method: 'PATCH',
            headers: {
                ...(token && { 'Authorization': `Bearer ${token}` }),
            },
            body: formData,
        });
        const contentType = response.headers.get('content-type');
        let responseData;
        if (contentType && contentType.includes('application/json')) {
            responseData = await response.json();
        } else {
            const textResponse = await response.text();
            console.error('Respuesta no JSON recibida:', textResponse);
            throw new Error('El servidor respondió con un formato incorrecto');
        }
        if (!response.ok) {
            const error = new Error(
                responseData.error ||
                responseData.detail ||
                'Error subiendo archivo'
            );
            error.status = response.status;
            error.data = responseData;
            throw error;
        }
        return responseData;
    } catch (error) {
        console.error('Error subiendo archivo:', error);
        throw error;
    }
};

export const apiRequest = async (endpoint, options = {}) => {
    const url = `${API_BASE_URL}${endpoint}`;
    const isPublicEndpoint =
        endpoint.includes('/register/') || endpoint.includes('/token/');
    const isFormData = options.body instanceof FormData;
    const baseHeaders = isFormData
        ? getFormDataHeaders()
        : isPublicEndpoint
            ? getPublicHeaders()
            : getAuthHeaders();

    const config = {
        method: options.method || 'GET',
        headers: {
            ...baseHeaders,
            ...options.headers
        }
    };

    if (options.body) {
        config.body = options.body;
    }

    try {
        const response = await fetch(url, config);
        if (response.status === 204) {
            return null;
        }
        const responseText = await response.text();
        let data = null;
        try {
            data = responseText ? JSON.parse(responseText) : null;
        } catch {
            data = null;
        }
        if (!response.ok) {
            let errorMessage =
                data?.error ||
                data?.detail ||
                data?.message ||
                `Error ${response.status}: ${response.statusText}`;
            if (data?.username) {
                errorMessage = `Usuario: ${Array.isArray(data.username) ? data.username.join(', ') : data.username}`;
            }
            if (data?.email) {
                errorMessage = `Email: ${Array.isArray(data.email) ? data.email.join(', ') : data.email}`;
            }
            if (data?.password) {
                errorMessage = `Contraseña: ${Array.isArray(data.password) ? data.password.join(', ') : data.password}`;
            }
            if (data?.non_field_errors) {
                errorMessage = Array.isArray(data.non_field_errors)
                    ? data.non_field_errors.join(', ')
                    : data.non_field_errors;
            }
            const error = new Error(errorMessage);
            error.status = response.status;
            error.data = data;
            throw error;
        }
        return data;
    } catch (error) {
        console.error('Error en petición API:', error);
        if (
            error.name === 'TypeError' &&
            error.message.includes('Failed to fetch')
        ) {
            const networkError = new Error(
                'Error de conexión. Verifica que el servidor Django esté ejecutándose en http://localhost:8000'
            );
            networkError.status = 0;
            throw networkError;
        }
        throw error;
    }
};
