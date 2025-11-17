import React, { useState } from 'react'
import { useAuth } from '../context/AuthContext.jsx'
import { useNavigate } from 'react-router-dom'
import RegisterComponent from '../components/RegisterComponent.jsx'

function LoginPage() {
    const [user, setUser] = useState('')
    const [password, setPassword] = useState('')
    const [errorMsg, setErrorMsg] = useState('')
    const [showRegister, setShowRegister] = useState(false)
    const navigate = useNavigate()
    const { login } = useAuth()

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
        <div className="min-vh-100 d-flex align-items-center justify-content-center p-3">
            <div className="position-absolute top-0 start-0 w-100 h-100" 
                    style={{
                        background: 'linear-gradient(135deg, var(--light-green) 0%, var(--olivine) 100%)'
                    }}>
            </div>
            <div className="card shadow-lg border-0 position-relative" 
                    style={{
                        backgroundColor: 'var(--tea-green)',
                        border: '3px solid var(--asparagus)',
                        borderRadius: '20px',
                        maxWidth: '400px',
                        width: '100%'
                    }}>
                <div className="card-body p-4 text-center">
                    <div className="mb-4">
                        <img src="/nysforum-high-resolution-logo-transparent.png" alt="NysForum Logo" className="logo-login"/>
                    </div>
                    {errorMsg && (
                        <div className="alert alert-danger mb-3" role="alert">
                            {errorMsg}
                        </div>
                    )}
                    <div className="mb-3">
                        <input type="text" className="form-control form-control-custom mb-3" placeholder="Usuario"value={user} onChange={(e) => setUser(e.target.value)} />
                        <input type="password" className="form-control form-control-custom" placeholder="Contraseña" value={password} onChange={(e) => setPassword(e.target.value)}/>
                    </div>
                    <div className="d-grid gap-2 mb-3">
                        <button className="btn btn-primary-custom"onClick={handleLogin}>
                            Iniciar Sesión
                        </button>
                        <button  className="btn btn-secondary-custom" onClick={handleInvitado}>
                            Entrar como Invitado
                        </button>
                    </div>
                    <div className="text-center">
                        <p className="mb-2" style={{ color: 'var(--dark-green)' }}>
                            ¿No tienes una cuenta?
                        </p>
                        <button className="btn btn-link p-0 fw-bold"style={{ color: 'var(--asparagus)', textDecoration: 'none' }}onClick={() => setShowRegister(true)}>
                            Regístrate aquí
                        </button>
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