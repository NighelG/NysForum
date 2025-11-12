import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'

function LoginPage() {
    const [user, setUser] = useState('')
    const [password, setPassword] = useState('')
    const [errorMsg, setErrorMsg] = useState('')
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
        navigate('/LobbyPage')
    }
    const handleLogin = async () => {
            if (!user || !password) {
                setErrorMsg("Por favor llena todos los espacios")
                return
            } try {
            const result = await login({ username: user, password: password })
            if (result.success) {
                localStorage.setItem(
                    "logueado",
                    JSON.stringify({
                    identificacion: result.user.id,
                    usuario: result.user.username,
                    admin: result.user.role === 'admin' || result.user.role === 'true_admin'
                })
            )  
            setUser('')
            setPassword('')
            navigate('/LobbyPage')
            console.log("Bienvenido")
            } else {
                setErrorMsg(result.error)
            }
            }catch(error) {
                setErrorMsg("Error al iniciar sesión")
        }
    }
  return (
    <div className='loginBody'>
        <p>Si no tienes una cuenta</p><Link to={"/RegisterPage"}><h3>Registrate</h3></Link>
        <br /><br />
        <h3>Iniciar Sesion</h3>
        <br />
        <div className='inputGroup'>
            <input type="text" placeholder='Usuario' value={user} onChange={(e) => setUser(e.target.value)} />
            <br /><br />
            <input type="password" placeholder='Contraseña' value={password} onChange={(e) => setPassword(e.target.value)} />
            <br /><br />
        </div>
        <button className='button' onClick={handleLogin}>Logearse</button>
        <button className='button' onClick={handleInvitado}>Invitado</button>
        {errorMsg && <h2>{errorMsg}</h2>}
    </div>
  )
}

export default LoginPage