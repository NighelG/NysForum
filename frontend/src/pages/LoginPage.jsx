import React, { useState } from 'react'
import { useAuth } from '../context/AuthContext.jsx'
import { useNavigate } from 'react-router-dom'
import RegisterComponent from '../components/RegisterComponent.jsx'
import '../styles/LoginPage.css'
import { useToast } from '../context/ToastContext.jsx'

function LoginPage() {
    const [user, setUser] = useState('')
    const [password, setPassword] = useState('')
    const [errorMsg, setErrorMsg] = useState('')
    const [showRegister, setShowRegister] = useState(false)
    const [showPassword, setShowPassword] = useState(false)
    const navigate = useNavigate()
    const { login, loginAsGuest } = useAuth()
    const { showToast } = useToast()
    
    const handleInvitado = () => {
        localStorage.setItem(
            "logueado",
            JSON.stringify({
                identificacion: "invitado",
                usuario: "Invitado",
                admin: false
            })
        )
        showToast("Entraste como invitado", "info")
        navigate('/forum')
    }

    const handleLogin = async () => {
        if (!user || !password) {
            setErrorMsg("Por favor llena todos los espacios")
            showToast("Por favor llena todos los espacios", "warning")
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
            const mensajesBienvenida = [
                "¡Listo para comentar cosas buenas!",
                "¡Nos alegra verte por aquí!",
                "¡A debatir con estilo!",
                "¡Bienvenido a la comunidad!",
                "¡Que empiece la diversión!",
                "El desarrollador tiene sueño, AH! Hola",
                "Pizza o hamburguesa?",
                "¡Tu opinión cuenta! (En serio, la contamos)",
                "¿Trajiste snacks? Es importante",
                "Preparados, listos... ¡a comentar!",
                "Otro humano detectado ✓",
                "¡Hola, viajero digital!",
                "Tu sesión está servida, calientita",
                "¿Sabías que los comentarios con emojis tienen +10 de poder?",
                "Bienvenido al lado bueno de internet",
                "Nos encanta cuando vuelves... o cuando vienes por primera vez",
                "¡Usuario reconocido! Desplegando confeti virtual",
                "Tu avatar está listo para la acción",
                "Modo debate: ACTIVADO",
                "¡Cargando diversión al 100%!",
                "¿Listo para cambiar el mundo? O al menos el hilo de conversación",
                "Tu conexión está a prueba de trolls",
                "¡Bienvenido! El café virtual está en la esquina",
                "Te estábamos esperando (no, en serio, el sistema hace polling)",
                "¡Hola! Tu sesión acaba de ganar +5 puntos de carisma",
                "Advertencia: Aquí se generan ideas potentes",
                "Bienvenido al club secreto... que no es tan secreto",
                "¡Saludos, ser de luz (o de modo oscuro)!",
                "Tu teclado está a punto de hacer magia",
                "¿Vienes a compartir sabiduría o a aprender? ¡Ambas son válidas!",
                "¡Usuario autenticado con éxito! Desbloqueando superpoderes...",
                "La comunidad acaba de mejorar en un 50%",
                "¡Hola! ¿Vamos a crear algo increíble hoy?",
                "Bienvenido a la zona libre de aburrimiento",
                "Tu presencia hace que el algoritmo sonría",
                "¡Acceso concedido al universo de ideas!",
                "Prepara tus mejores argumentos... ¡y también los divertidos!",
                "Detectamos una persona interesante entrando al sistema ✓",
                "¡Bienvenido! El WiFi de las buenas conversaciones es excelente aquí",
                "Tu sesión viene con cookies (las digitales, lo siento)",
                "¡Hola! ¿Listo para dejar tu huella digital? (la buena)",
                "Activando modo inspiración... ¡listo!",
                "La inteligencia colectiva acaba de aumentar",
                "¡Saludos! Tu bandeja de entrada de ideas está vacía, ¿la llenamos?",
                "Bienvenido al lugar donde las conversaciones cobran vida",
                "¡Usuario verificado como 'awesome'!",
                "¿Traes ideas? Tenemos café virtual para desarrollarlas",
                "¡Hola! El mundo necesita tu voz (y nosotros también)",
                "Entrando en la dimensión de las buenas conversaciones...",
                "Tu llegada ha activado el protocolo de bienvenida épica",
                "¡Bienvenido a bordo, navegante del conocimiento!",
                "Si quieren contactar con el desarrollador primero ofrezcan café por GitHub",
                "Sin microtransacciones, por ahora..."
            ]
            const randomMsg = mensajesBienvenida[Math.floor(Math.random() * mensajesBienvenida.length)]
            showToast(`${randomMsg}`, "success")
            setUser('')
            setPassword('')
            navigate('/forum')
        } catch(error) {
            const msg = error.message || "Error al iniciar sesión"
            setErrorMsg(msg)
            showToast(msg, "error")
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
                                    showToast("Entraste como invitado", "info")
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
                <RegisterComponent onClose={() => setShowRegister(false)} />
            )}
        </div>
    )
}

export default LoginPage
