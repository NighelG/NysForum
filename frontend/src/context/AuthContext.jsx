import { createContext, useState, useContext, useEffect } from 'react';
import authService from '../services/authService';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
const [user, setUser] = useState(null);
const [loading, setLoading] = useState(true);

useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
    verifyStoredToken(token);
    } else {
    setLoading(false);
    }
}, []);

const verifyStoredToken = async (token) => {
    try {
    const data = await authService.verifyToken(token);
    if (data.success) {
        setUser(data.user);
    } else {
        localStorage.removeItem('token');
    }
    } catch (error) {
    console.error('Error verifying token:', error);
    localStorage.removeItem('token');
    } finally {
    setLoading(false);
    }
};

const login = async (credentials) => {
    try {
    const data = await authService.loginUser(credentials);
    if (data.success) {
        localStorage.setItem('token', data.token);
        setUser(data.user);
        return { success: true };
    }
    return { success: false, error: data.message };
    } catch (error) {
    return { success: false, error: 'Error de conexión' };
    }
};

const register = async (userData) => {
    try {
    const data = await authService.registerUser(userData);
    if (data.success) {
        localStorage.setItem('token', data.token);
        setUser(data.user);
        return { success: true };
    }
    return { success: false, error: data.message };
    } catch (error) {
    return { success: false, error: 'Error de conexión' };
    }
};

const logout = async () => {
    try {
    await authService.logoutUser();
    } catch (error) {
    console.error('Error en logout:', error);
    } finally {
    localStorage.removeItem('token');
    setUser(null);
    }
};

return (
    <AuthContext.Provider value={{ user, login, register, logout, loading }}>
    {children}
    </AuthContext.Provider>
);
};

export const useAuth = () => useContext(AuthContext);