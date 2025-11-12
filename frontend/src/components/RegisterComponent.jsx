import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from "../context/AuthContext.jsx"

function RegisterComponent() {
    const [user, setUser] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [confirmarPassword, setConfirmarPassword] = useState('')
    const [errorMsg, setErrorMsg] = useState('')
    const navigate = useNavigate()
    const { register } = useAuth()

    function validarCorreo(correo) {
        const dirrecPopular = /^[a-zA-Z0-9._%+-]+@(gmail\.com|googlemail\.com|hotmail\.com|outlook\.com|live\.com|yahoo\.com|yahoo\.es)$/i
        if (!dirrecPopular.test(correo)) {
            console.log("Correo no válido, solo se aceptan dominios populares")
            return false
        }
        return true
    }
    const validarUsuario = () => {
        return user.length >= 3
    }
    const validarPassword = () => {
        return password.length >= 8
    }
    const handleRegistro = async () => {
        if (!user || !email || !password || !confirmarPassword) {
            setErrorMsg("Por favor, llena todos los espacios")
            return
        }
        if (password !== confirmarPassword) {
            setErrorMsg("Las contraseñas no son iguales")
            return
        }
        if (!validarUsuario()) {
            setErrorMsg("El nombre de usuario debe tener al menos 3 caracteres")
            return
        }
        if (!validarPassword()) {
            setErrorMsg("La contraseña debe tener al menos 8 caracteres")
            return
        }
        if (!validarCorreo(email)) {
            setErrorMsg("Por favor ingresa un correo válido")
            return
        }
        try {
        const result = await register({
            username: user,
            email: email,
            password: password,
            password_confirm: confirmarPassword,
            first_name: "",
            last_name: "" 
        })
        if (result.success) {
            navigate('/LobbyPage')
            console.log("Registrado con exito")
        } else {
            setErrorMsg(result.error)
        }  
        } catch (error) {
        setErrorMsg("Error al registrar el usuario")
        }
    }

    return (
        <div className='registerBody'>
            <br />
            <h2>Registro</h2>
            <p>Completa los siguientes espacios</p>
            <br /><br />
            <label >
                <input type="text" placeholder='Nombre del Usuario' minLength={"3"} maxLength={"20"} value={user} onChange={(e) => setUser(e.target.value)}/>
            </label>
            <br /><br />
            <label >
                <input type="email" placeholder='Correo' value={email} onChange={(e) => setEmail(e.target.value)} />
            </label>
            <br /><br />
            <label >
                <input type="password" placeholder='Contraseña' minLength={"8"} maxLength={"15"} value={password} onChange={(e) => setPassword(e.target.value)} />
            </label>
            <br /><br />
            <label >
                <input type="password" placeholder='Confirmar Contraseña' value={confirmarPassword} onChange={(e) => setConfirmarPassword(e.target.value)} />
            </label>
            <br /><br />
            <button className='button' onClick={handleRegistro}>Registrarse</button>
            {errorMsg && <h2>{errorMsg}</h2>}
        </div>
    )
}

export default RegisterComponent