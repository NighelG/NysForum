import { createContext, useState, useContext, useEffect } from 'react'
import { authService } from '../services/authService.js'

const AuthContext = createContext()

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null)
    const [loading, setLoading] = useState(true)
    
    useEffect(() => {
        checkAuth()
    }, [])
    const checkAuth = async () => {
        const token = localStorage.getItem('authToken')
        if (!token) {
            setLoading(false)
            return
        }
        try {
            const userData = await authService.getCurrentUser()
            setUser(userData)
        } catch (error) {
            console.error('Error verificando autenticación:', error)
            localStorage.removeItem('authToken')
        } finally {
            setLoading(false)
        }
    }
    const login = async (username, password) => {
        try {
            const tokens = await authService.login(username, password)
            localStorage.setItem('authToken', tokens.access)
            const userData = await authService.getCurrentUser()
            setUser(userData)
            return userData
        } catch (error) {
            throw new Error(error.message || 'Credenciales inválidas')
        }
    }
    const register = async (userData) => {
        try {
            const result = await authService.register(userData)
            return { 
                success: true, 
                message: 'Registro exitoso. Ahora puedes iniciar sesión.',
                user: result 
            }
        } catch (error) {
            throw new Error(error.message || 'Error en el registro')
        }
    }
    const logout = () => {
        localStorage.removeItem('authToken')
        setUser(null)
    }
    return (
        <AuthContext.Provider value={{ 
            user, 
            login, 
            register, 
            logout, 
            loading,
            isAuthenticated: !!user 
        }}>
            {children}
        </AuthContext.Provider>
    )
}
export const useAuth = () => {
    const context = useContext(AuthContext)
    if (!context) {
        throw new Error('useAuth debe ser usado dentro de AuthProvider')
    }
    return context
}