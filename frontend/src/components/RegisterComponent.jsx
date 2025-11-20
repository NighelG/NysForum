import React, { useState, useEffect } from 'react'
import { authService } from '../services/authService.js'
import '../styles/CreatePostDrawer.css'

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
            return
        }
        if (formData.password !== formData.password_confirm) {
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
        if (!validarCorreo(formData.email)) {
            setErrorMsg("Por favor ingresa un correo válido de dominio popular (Gmail, Hotmail, Yahoo, etc.)")
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
            setErrorMsg('success: ¡Registro exitoso! Ahora puedes iniciar sesión.')
            setTimeout(() => {
                onClose()
            }, 2000)
        } catch (error) {
            console.error('Error en registro:', error)
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
            <div className="modal-backdrop" onClick={onClose}></div>
            <div className="modal-container"onClick={(e) => e.stopPropagation()}>
                <div className="d-flex justify-content-between align-items-center mb-4">
                    <h3 className="mb-0" style={{ color: 'var(--text-dark)' }}> Crear Cuenta</h3>
                    <button onClick={onClose}className="btn-close"style={{ fontSize: '1.2rem' }}></button>
                </div>
                {errorMsg && (
                    <div className={`alert ${errorMsg.includes('success:') ? 'alert-success-custom' : 'alert-danger-custom'} mb-3`}role="alert">
                        {errorMsg.replace('success: ', '')}
                    </div>
                )}
                <div className="row">
                    <div className="col-md-6 mb-3">
                        <input type="text" className="form-control form-control-custom" placeholder="Nombre (opcional)" value={formData.first_name} 
                            onChange={(e) => handleInputChange('first_name', e.target.value)} disabled={isLoading}/>
                    </div>
                    <div className="col-md-6 mb-3">
                        <input type="text"  className="form-control form-control-custom" placeholder="Apellido (opcional)"value={formData.last_name}  
                            onChange={(e) => handleInputChange('last_name', e.target.value)} disabled={isLoading} />
                    </div>
                </div>
                <div className="mb-3">
                    <input type="text" className="form-control form-control-custom" placeholder="Nombre de Usuario *" minLength="3" maxLength="20"
                        value={formData.username}  onChange={(e) => handleInputChange('username', e.target.value)}disabled={isLoading} required/>
                </div>
                <div className="mb-3">
                    <input type="email" className="form-control form-control-custom" placeholder="Correo Electrónico *" value={formData.email} 
                        onChange={(e) => handleInputChange('email', e.target.value)} disabled={isLoading} required />
                </div>
                <div className="row">
                    <div className="col-md-6 mb-3">
                        <div className="position-relative">
                            <input type={showPassword ? "text" : "password"} className="form-control form-control-custom"placeholder="Contraseña *"minLength="8"
                                maxLength="15"value={formData.password} onChange={(e) => handleInputChange('password', e.target.value)} disabled={isLoading} required/>
                            <button type="button"className="btn btn-sm position-absolute end-0 top-50 translate-middle-y me-2"
                                style={{ background: 'none', border: 'none' }}onClick={() => setShowPassword(!showPassword)}>
                                {showPassword ? <img src="/pwoff.png" alt="" /> : <img src="/pwon.png" alt="" />}
                            </button>
                        </div>
                    </div>
                    <div className="col-md-6 mb-3">
                        <div className="position-relative">
                            <input type={showPasswordConfirm ? "text" : "password"}  className="form-control form-control-custom" placeholder="Confirmar Contraseña *" 
                                value={formData.password_confirm} onChange={(e) => handleInputChange('password_confirm', e.target.value)} disabled={isLoading}required/>
                            <button type="button"className="btn btn-sm position-absolute end-0 top-50 translate-middle-y me-2"
                                style={{ background: 'none', border: 'none' }}onClick={() => setShowPasswordConfirm(!showPasswordConfirm)}>
                                {showPassword ? <img src="/pwoff.png" alt="" /> : <img src="/pwon.png" alt="" />}
                            </button>
                        </div>
                    </div>
                </div>
                <button className="btn btn-primary-custom w-100 mb-3"onClick={handleRegistro}disabled={isLoading}>
                    {isLoading ? 'Registrando...' : 'Crear Cuenta'}
                </button>
                <div className="text-center">
                    <small className="text-muted">
                        Al registrarte, aceptas nuestros términos y condiciones
                    </small>
                </div>
            </div>
        </>
    )
}

export default RegisterComponent