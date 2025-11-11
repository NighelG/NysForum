import { useState, useCallback } from "react";

export const useAPI = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

}

    const execute = useCallback(async (apiCall, ...args) => {
        setLoading(true);
        setError(null);
        
        try{
            const result = await apiCall(...args);
            return result;
        } catch (error) {
            setError (error.message);
            throw error;
        }
    })