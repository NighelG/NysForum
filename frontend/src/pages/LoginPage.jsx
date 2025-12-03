import React, { useState } from 'react'
import { useAuth } from '../context/AuthContext.jsx'
import { useNavigate } from 'react-router-dom'
import RegisterComponent from '../components/RegisterComponent.jsx'
import '../styles/LoginPage.css'

function LoginPage() {
    const [user, setUser] = useState('')
    const [password, setPassword] = useState('')
    const [errorMsg, setErrorMsg] = useState('')
    const [showRegister, setShowRegister] = useState(false)
    const [showPassword, setShowPassword] = useState(false)
    const navigate = useNavigate()
    const { login, loginAsGuest } = useAuth()

    const handleInvitado = () => {
        localStorage.setItem(
            "logueado",
            JSON.stringify({
                identificacion: "invitado",
                usuario: "Invitado",
                admin: false
            })
        )
        navigate('/forum')
    }

    const handleLogin = async () => {
        if (!user || !password) {
            setErrorMsg("Por favor llena todos los espacios")
            return
        }
        try {
            const userData = await login(user, password)
            localStorage.setItem(
                "logueado",
                JSON.stringify({
                    identificacion: userData.id || "user",
                    usuario: userData.username || user,
                    admin: userData.role === 'admin' || userData.role === 'true_admin'
                })
            )  
            setUser('')
            setPassword('')
            navigate('/forum')
            console.log("Bienvenido")
        } catch(error) {
            setErrorMsg(error.message || "Error al iniciar sesión")
        }
    }

    return (
        <div className="login-container">
            <div className="login-background"></div>
            <div className="login-card">
                <div className="login-card-body">
                    <div className="login-logo-container">
                        <img src="/nys-nice-forum-logo.png"  alt="Foro Logo" className="login-logo"/>
                    </div>
                    <h2 className="login-title">Acceso al Foro</h2>
                    <p className="login-subtitle">Únete a la discusión</p>
                    {errorMsg && (
                        <div className="login-error" role="alert">
                            {errorMsg}
                        </div>
                    )}
                    <div className="login-form">
                        <input type="text" className="login-input" placeholder="Nombre de usuario" value={user} onChange={(e) => setUser(e.target.value)}/>
                        <div className="login-input-password-container">
                            <input type={showPassword ? "text" : "password"} className="login-input-password" placeholder="Contraseña" value={password} onChange={(e) => setPassword(e.target.value)}/>
                            <button type="button" className="login-toggle-password" onClick={() => setShowPassword(!showPassword)}>{showPassword ? "Ocultar" : "Mostrar"}</button>
                        </div>
                    </div>
                    <div className="login-buttons">
                        <button className="login-btn-primary" onClick={handleLogin}>Iniciar Sesión</button>
                        <button className="login-btn-secondary"
                            onClick={() => {
                                loginAsGuest();
                                navigate('/forum');
                            }}>
                            Entrar como invitado
                        </button>
                    </div>
                    <div className="login-register-container">
                        <p className="login-register-text">¿No tienes una cuenta?</p>
                        <button className="login-register-link" onClick={() => setShowRegister(true)}> Regístrate aquí</button>
                    </div>
                </div>
            </div>
            {showRegister && (
                <RegisterComponent 
                    onClose={() => setShowRegister(false)}
                />
            )}
        </div>
    )
}

export default LoginPage