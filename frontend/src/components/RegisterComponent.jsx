import React, { useState, useEffect } from 'react'
import { useToast } from '../context/ToastContext'
import { authService } from '../services/authService.js'
import '../styles/RegisterComponent.css'

function RegisterComponent({ onClose }) {
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        password_confirm: '',
        first_name: '',
        last_name: ''
    })
    const [errorMsg, setErrorMsg] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const [showPassword, setShowPassword] = useState(false)
    const [showPasswordConfirm, setShowPasswordConfirm] = useState(false)
    const { showToast } = useToast()
    
    useEffect(() => {
        document.body.classList.add('modal-open')
        
        return () => {
            document.body.classList.remove('modal-open')
        }
    }, [])
    
    const handleInputChange = (field, value) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }))
    }
    
    function validarCorreo(correo) {
        const dirrecPopular = /^[a-zA-Z0-9._%+-]+@(gmail\.com|googlemail\.com|hotmail\.com|outlook\.com|live\.com|yahoo\.com|yahoo\.es)$/i
        return dirrecPopular.test(correo)
    }
    
    const validarUsuario = () => formData.username.length >= 3
    const validarPassword = () => formData.password.length >= 8
    
    const handleRegistro = async () => {
        setErrorMsg('')
        if (!formData.username || !formData.email || !formData.password || !formData.password_confirm) {
            setErrorMsg("Por favor, llena todos los espacios obligatorios")
            showToast("Por favor, llena todos los espacios obligatorios", "warning")
            return
        }
        if (formData.password !== formData.password_confirm) {
            setErrorMsg("Las contraseñas no son iguales")
            showToast("Las contraseñas no coinciden", "warning")
            return
        }
        if (!validarUsuario()) {
            setErrorMsg("El nombre de usuario debe tener al menos 3 caracteres")
            showToast("Nombre de usuario debe tener al menos 3 caracteres", "warning")
            return
        }
        if (!validarPassword()) {
            setErrorMsg("La contraseña debe tener al menos 8 caracteres")
            showToast("La contraseña debe tener al menos 8 caracteres", "warning")
            return
        }
        if (!validarCorreo(formData.email)) {
            setErrorMsg("Por favor ingresa un correo válido de dominio popular (Gmail, Hotmail, Yahoo, etc.)")
            showToast("Correo electrónico no válido", "warning")
            return
        }
        
        setIsLoading(true)
        try {
            console.log('Iniciando proceso de registro...')
            const result = await authService.register({
                username: formData.username,
                email: formData.email,
                password: formData.password,
                password_confirm: formData.password_confirm,
                first_name: formData.first_name,
                last_name: formData.last_name
            })
            console.log('Registro exitoso:', result)
            showToast('¡Registro exitoso! Ahora puedes iniciar sesión.', 'success')
            setErrorMsg('success: ¡Registro exitoso! Ahora puedes iniciar sesión.')
            setTimeout(() => {
                onClose()
            }, 2000)
        } catch (error) {
            console.error('Error en registro:', error)
            showToast('Error en el registro. Verifica tus datos.', 'error')
            if (error.message.includes('username')) {
                setErrorMsg('El nombre de usuario ya existe o no es válido')
            } else if (error.message.includes('email')) {
                setErrorMsg('El correo electrónico ya está registrado o no es válido')
            } else if (error.message.includes('password')) {
                setErrorMsg('La contraseña no cumple los requisitos')
            } else {
                setErrorMsg(error.message || "Error al registrar el usuario.")
            }
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <>
            <div className="register-modal-backdrop" onClick={onClose}></div>
            <div className="register-modal-container" onClick={(e) => e.stopPropagation()}>
                <div className="register-modal-header">
                    <h3 className="register-modal-title">Crear Cuenta</h3>
                    <button onClick={onClose} className="register-modal-close" aria-label="Cerrar"> X</button>
                </div>
                {errorMsg && (
                    <div className={errorMsg.includes('success:') ? 'register-success' : 'register-error'}>
                        {errorMsg.replace('success: ', '')}
                    </div>
                )}
                <div className="register-form-grid">
                    <input type="text" className="register-input" placeholder="Nombre (opcional)" value={formData.first_name} 
                        onChange={(e) => handleInputChange('first_name', e.target.value)} disabled={isLoading}/>
                    <input type="text" className="register-input" placeholder="Apellido (opcional)" value={formData.last_name} 
                        onChange={(e) => handleInputChange('last_name', e.target.value)} disabled={isLoading}/>
                    <input type="text" className="register-input register-input-full" placeholder="Nombre de Usuario *"minLength="3" maxLength="20" value={formData.username}
                        onChange={(e) => handleInputChange('username', e.target.value)} disabled={isLoading} required/>
                    <input type="email" className="register-input register-input-full" placeholder="Correo Electrónico *"
                        value={formData.email} onChange={(e) => handleInputChange('email', e.target.value)}disabled={isLoading}required/>
                    <div className="register-password-container">
                        <input type={showPassword ? "text" : "password"}  className="register-password-input" placeholder="Contraseña *" minLength="8"maxLength="15"
                            value={formData.password}onChange={(e) => handleInputChange('password', e.target.value)} disabled={isLoading} required/>
                        <button type="button" className="register-toggle-password" onClick={() => setShowPassword(!showPassword)} disabled={isLoading}> {showPassword ? "Ocultar" : "Mostrar"} </button>
                    </div>
                    <div className="register-password-container">
                        <input type={showPasswordConfirm ? "text" : "password"} className="register-password-input" placeholder="Confirmar Contraseña *" value={formData.password_confirm}
                            onChange={(e) => handleInputChange('password_confirm', e.target.value)} disabled={isLoading} required/>
                        <button type="button" className="register-toggle-password" onClick={() => setShowPasswordConfirm(!showPasswordConfirm)} disabled={isLoading}>
                            {showPasswordConfirm ? "Ocultar" : "Mostrar"}
                        </button>
                    </div>
                </div>
                <button className="register-submit-btn" onClick={handleRegistro} disabled={isLoading}>{isLoading ? 'Registrando...' : 'Crear Cuenta'}</button>
                <div className="register-terms">
                    <small>Al registrarte, aceptas nuestros términos y condiciones</small>
                </div>
            </div>
        </>
    )
}

export default RegisterComponent