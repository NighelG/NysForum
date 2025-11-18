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
        const isGuest = localStorage.getItem('isGuest')

        if (isGuest) {
            setUser({ 
                isGuest: true, 
                username: 'Invitado',
                id: 'guest',
                role: 'guest'
            })
            setLoading(false)
            return
        }

        if (!token) {
            setLoading(false)
            return
        }
        
        try {
            const userData = await authService.getCurrentUser()
            setUser({ ...userData, isGuest: false })
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
            localStorage.removeItem('isGuest')
            
            const userData = await authService.getCurrentUser()
            setUser({ ...userData, isGuest: false })
            return userData
        } catch (error) {
            throw new Error(error.message || 'Credenciales inválidas')
        }
    }

    const loginAsGuest = () => {
        localStorage.setItem('isGuest', 'true')
        localStorage.removeItem('authToken')
        setUser({ 
            isGuest: true, 
            username: 'Invitado',
            id: 'guest',
            role: 'guest'
        })
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
    
    const deleteUser = async () => {
        try {
            const result = await authService.deleteUser()
            localStorage.removeItem('authToken')
            localStorage.removeItem('logueado')
            localStorage.removeItem('isGuest')
            setUser(null)
            return result
        } catch (error) {
            throw new Error(error.message || 'Error al eliminar la cuenta')
        }
    }
    
    const logout = () => {
        localStorage.removeItem('authToken')
        localStorage.removeItem('isGuest')
        localStorage.removeItem('logueado')
        setUser(null)
    }
    
    return (
        <AuthContext.Provider value={{ 
            user, 
            login, 
            register, 
            logout,
            deleteUser,
            loginAsGuest, // ← NUEVO: Exportar función
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