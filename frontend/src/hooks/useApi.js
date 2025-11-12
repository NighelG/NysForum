import { useState, useCallback } from "react";

export const useApi = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);  
    const execute = useCallback(async (apiCall, ...args) => {
        setLoading(true);
        setError(null);
        try {
            const result = await apiCall(...args);
            return result;
        } catch (err) {
            const errorMessage = err.message || 'Error en la operación';
            setError(errorMessage);
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);
    const clearError = useCallback(() => {
        setError(null);
    }, []);

    return {
        loading,
        error,
        execute,
        clearError
    };
};