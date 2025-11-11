import { useState, useCallback } from "react";

export const useApi  = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    
    const execute = useCallback(async (apiCall, ...args) => {
        setLoading(true);
        setError(null);  
        try{
            const result = await apiCall(...args);
            return result;
        } catch (err) {
            setError(err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    }, [])

    return {
        loading,
        error,
        execute
    };
}
