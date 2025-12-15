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
            setUser(null)
            setLoading(false)
            return false
        }
        
        try {
            const response = await fetch('http://localhost:8000/api/users/profiles/me/', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            })
            
            if (!response.ok) {
                localStorage.removeItem('authToken')
                localStorage.removeItem('logueado')
                localStorage.removeItem('user_profile')
                setUser(null)
                setLoading(false)
                return false
            }
            
            const userData = await response.json()
            setUser(userData)
            setLoading(false)
            return true
            
        } catch (error) {
            localStorage.removeItem('authToken')
            localStorage.removeItem('logueado')
            localStorage.removeItem('user_profile')
            setUser(null)
            setLoading(false)
            return false
        }
    }

    const login = async (username, password) => {
        try {
            const response = await fetch('http://localhost:8000/api/token/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ username, password })
            })
            
            if (!response.ok) {
                throw new Error('Credenciales incorrectas')
            }
            
            const data = await response.json()
            localStorage.setItem('authToken', data.access)
            
            const profileResponse = await fetch('http://localhost:8000/api/users/profiles/me/', {
                headers: {
                    'Authorization': `Bearer ${data.access}`,
                    'Content-Type': 'application/json'
                }
            })
            
            if (!profileResponse.ok) {
                localStorage.removeItem('authToken')
                throw new Error('Error obteniendo perfil')
            }
            
            const userProfile = await profileResponse.json()
            setUser(userProfile)
            return userProfile
            
        } catch (error) {
            localStorage.removeItem('authToken')
            throw error
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
        setLoading(false)
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
            loginAsGuest,
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