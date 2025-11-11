import { useState, useEffect } from "react"
import { authService } from '../services/authService';

export const useAuth = () => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    useEffect(() => {
        checkAuth();
    }, []);
    const checkAuth = async () =>{
        const token = localStorage.getItem('authToken');
        if (!token) {
            setLoading(false);
            return;
        }
        try {
            const userData = await authService.getCurrentUser();
            setUser(userData);
        } catch (error) {
            console.error('Error de autenticacion:', error);
            logout();
        }finally {
            setLoading(false)
        }
    };
    const login = async (username, password) => {
        const tokens = await authService.login(username, password);
        localStorage.setItem('authToken', tokens.access);
        const userData = await authService.getCurrentUser();
        setUser(userData);
        return userData;
    };
    const logout = () => {
        localStorage.removeItem('authToken');
        setUser(null);
    };
    return {
        user,
        loading,
        login,
        logout,
        isAuthenticated: !!user
    };
};