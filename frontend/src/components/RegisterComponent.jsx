import { useState } from 'react'
import { useAuth } from '../context/AuthContext'

const RegisterComponent = ({ onBack }) => {
const [registerData, setRegisterData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
})
const [formErrors, setFormErrors] = useState({})
const { register, loading } = useAuth()

const validateForm = () => {
    const errors = {};  
    if (!registerData.username.trim()) {
    errors.username = 'El nombre de usuario es requerido'
    }
    if (!registerData.email.trim()) {
    errors.email = 'El email es requerido'
    } else if (!/\S+@\S+\.\S+/.test(registerData.email)) {
    errors.email = 'El email no es válido'
    }
    if (!registerData.password) {
    errors.password = 'La contraseña es requerida'
    } else if (registerData.password.length < 6) {
    errors.password = 'La contraseña debe tener al menos 6 caracteres'
    }
    if (registerData.password !== registerData.confirmPassword) {
    errors.confirmPassword = 'Las contraseñas no coinciden'
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0
}
const handleRegister = async (e) => {
    e.preventDefault()
    
    if (!validateForm()) return

    const result = await register(registerData)
    if (!result.success) {
    alert(result.error)
    }
}
const handleInputChange = (field, value) => {
    setRegisterData(prev => ({ ...prev, [field]: value }))
    if (formErrors[field]) {
    setFormErrors(prev => ({ ...prev, [field]: '' }))
    }
}

return (
    <div className="card">
    <div className="card-body">
        <div className="d-flex justify-content-between align-items-center mb-3">
        <h3 className="card-title mb-0">Registro</h3>
        <button className="btn btn-sm btn-outline-secondary" onClick={onBack}>Volver</button>
        </div>
        
        <form onSubmit={handleRegister}>
        <div className="mb-3">
        <label className="form-label">Nombre de Usuario</label>
            <input type="text" className={`form-control ${formErrors.username ? 'is-invalid' : ''}`}value={registerData.username}onChange={(e) => handleInputChange('username', e.target.value)}required />
            {formErrors.username && (
            <div className="invalid-feedback">{formErrors.username}</div>
            )}
        </div>
        
        <div className="mb-3">
            <label className="form-label">Email</label>
            <input type="email" className={`form-control ${formErrors.email ? 'is-invalid' : ''}`}value={registerData.email} onChange={(e) => handleInputChange('email', e.target.value)} required />
            {formErrors.email && (
            <div className="invalid-feedback">{formErrors.email}</div>
            )}
        </div>
        
        <div className="mb-3">
            <label className="form-label">Contraseña</label>
            <input type="password" className={`form-control ${formErrors.password ? 'is-invalid' : ''}`}value={registerData.password}onChange={(e) => handleInputChange('password', e.target.value)} required />
            {formErrors.password && (
            <div className="invalid-feedback">{formErrors.password}</div>
            )}
        </div>
        
        <div className="mb-3">
            <label className="form-label">Confirmar Contraseña</label>
            <input type="password" className={`form-control ${formErrors.confirmPassword ? 'is-invalid' : ''}`} value={registerData.confirmPassword} onChange={(e) => handleInputChange('confirmPassword', e.target.value)} required/>
            {formErrors.confirmPassword && (
            <div className="invalid-feedback">{formErrors.confirmPassword}</div>
            )}
        </div>
        <button type="submit" className="btn btn-success w-100"disabled={loading}>{loading ? 'Registrando...' : 'Registrarse'}</button>
        </form>
    </div>
    </div>
);
};

export default RegisterComponent;