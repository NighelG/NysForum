import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { authService } from '../services/authService'

function UserSettingsPage() {
    const navigate = useNavigate()
    const [user, setUser] = useState(null)
    const [activeSection, setActiveSection] = useState('profile')
    const [loading, setLoading] = useState(false)
    const [messages, setMessages] = useState({ error: '', success: '' })
    const [formData, setFormData] = useState({
        avatar: '',
        bio: '',
        username: '',
        email: ''
    })
    useEffect(() => {
        loadUser()
    }, [])
    const loadUser = async () => {
        try {
            const userData = await authService.getCurrentUser()
            setUser(userData)
            setFormData({
                avatar: userData.avatar || '',
                bio: userData.bio || '',
                username: userData.username || '',
                email: userData.email || ''
            })
        } catch (error) {
            setMessages({ error: 'Error cargando datos del usuario' })
        }
    }
    function validarCorreo(correo) {
        const dirrecPopular = /^[a-zA-Z0-9._%+-]+@(gmail\.com|googlemail\.com|hotmail\.com|outlook\.com|live\.com|yahoo\.com|yahoo\.es)$/i
        return dirrecPopular.test(correo)
    }
    const updateProfile = async () => {
        setLoading(true)
        setMessages({ error: '', success: '' })
        try {
            const updateData = {}
            if (formData.avatar) updateData.avatar = formData.avatar
            if (formData.bio) updateData.bio = formData.bio

            if (Object.keys(updateData).length === 0) {
                setMessages({ error: 'No hay cambios para guardar' })
                setLoading(false)
                return
            }
            const updatedUser = await authService.updateProfile(updateData)
            setMessages({ success: 'Perfil actualizado correctamente' })
            setUser(updatedUser)
        } catch (error) {
            setMessages({ error: error.message })
        }
        setLoading(false)
    }
    const updateAccount = async () => {
        setLoading(true)
        setMessages({ error: '', success: '' })
        try {
            if (!validarCorreo(formData.email)) {
                setMessages({ error: 'Por favor ingresa un correo válido' })
                setLoading(false)
                return
            }
            const updateData = {}
            if (formData.username && formData.username !== user.username) {
                updateData.username = formData.username
            }
            if (formData.email && formData.email !== user.email) {
                updateData.email = formData.email
            }
            if (Object.keys(updateData).length === 0) {
                setMessages({ error: 'No hay cambios para guardar' })
                setLoading(false)
                return
            }
            const updatedUser = await authService.updateAccount(updateData)
            setMessages({ success: 'Cuenta actualizada correctamente' })
            setUser(updatedUser)
        } catch (error) {
            setMessages({ error: error.message })
        }
        setLoading(false)
    }
    const deleteAccount = async () => {
        if (!window.confirm('¿Estás seguro de que quieres eliminar tu cuenta? Esta acción no se puede deshacer.')) {
            return
        }
        setLoading(true)
        try {
            await authService.deleteUser()
            localStorage.removeItem('authToken')
            localStorage.removeItem('refreshToken')
            localStorage.removeItem('logueado')
            setMessages({ success: 'Cuenta eliminada correctamente' })
            setTimeout(() => {
                navigate('/login')
            }, 2000)
        } catch (error) {
            setMessages({ error: error.message })
            setLoading(false)
        }
    }
    const handleImageUpload = (e) => {
        const file = e.target.files[0]
        if (!file) return
        if (!file.type.startsWith('image/')) {
            setMessages({ error: 'El archivo debe ser una imagen' })
            return
        }
        if (file.size > 5 * 1024 * 1024) {
            setMessages({ error: 'La imagen no debe pesar más de 5MB' })
            return
        }
        const reader = new FileReader()
        reader.onload = (e) => {
            setFormData(prev => ({ ...prev, avatar: e.target.result }))
        }
        reader.readAsDataURL(file)
    }
    if (!user) {
        return (
            <div className="user-settings-page">
                <div className="loading-container">
                    <p>Cargando información del usuario...</p>
                </div>
            </div>
        )
    }
    
    return (
        <div className="user-settings-page">
            <div className="settings-container">
                <div className="settings-sidebar">
                    <h3>Configuración</h3>
                    <button className={`sidebar-option ${activeSection === "profile" ? "active" : ""}`}onClick={() => setActiveSection("profile")}>
                        Perfil
                    </button>
                    <button className={`sidebar-option ${activeSection === "personalization" ? "active" : ""}`} onClick={() => setActiveSection("personalization")}>
                        Personalización
                    </button>
                    <button className={`sidebar-option ${activeSection === "account" ? "active" : ""}`} onClick={() => setActiveSection("account")}>
                        Cuenta
                    </button>
                    <button className={`sidebar-option danger ${activeSection === "danger" ? "active" : ""}`}onClick={() => setActiveSection("danger")}>
                        Zona Peligrosa
                    </button>
                </div>
                <div className="settings-content">
                    {messages.error && (
                        <div className="alert alert-error">{messages.error}</div>
                    )}
                    {messages.success && (
                        <div className="alert alert-success">{messages.success}</div>
                    )}
                    {activeSection === 'profile' && (
                        <div className="settings-section">
                            <h2>Información del Perfil</h2>
                            <div className="profile-info">
                                <img src={user.avatar || "/defaultPFP.jpg"} alt="Avatar" className="profile-picture"/>
                                <div className="profile-details">
                                    <h3>{user.username}</h3>
                                    <p className="profile-bio">{user.bio || "Sin biografía"}</p>
                                    <p className="profile-email">{user.email}</p>
                                    <p className="profile-stats"> Publicaciones: {user.posts_count} | Comentarios: {user.comments_count}</p>
                                    <p className="profile-join-date"> Miembro desde: {new Date(user.date_joined).toLocaleDateString()}</p>
                                    <p className="profile-role">Rol: {user.role}</p>
                                    <p className="profile-status">Estado: {user.status}</p>
                                </div>
                            </div>
                        </div>
                    )}
                    {activeSection === 'personalization' && (
                        <div className="settings-section">
                            <h2>Personalización</h2>
                            <div className="form-group">
                                <label>Avatar</label>
                                <div className="current-image">
                                    <img src={formData.avatar || user.avatar || "/img/defaultPFP.jpg"} alt="Preview" className="image-preview"/>
                                </div>
                                <input type="url" className="form-input"placeholder="URL del avatar" value={formData.avatar} 
                                    onChange={(e) => setFormData(prev => ({ ...prev, avatar: e.target.value }))} />
                                <p className="form-help">O sube una imagen local:</p>
                                <input type="file" className="form-input"accept="image/*" onChange={handleImageUpload}  />
                            </div>
                            <div className="form-group">
                                <label>Biografía</label>
                                <textarea className="form-textarea"value={formData.bio} onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
                                    placeholder="Cuéntanos algo sobre ti..."rows="4"maxLength="500"/>
                                <p className="form-help">{formData.bio.length}/500 caracteres</p>
                            </div>
                            <button className="btn-primary" onClick={updateProfile}disabled={loading}>
                                {loading ? "Guardando..." : "Guardar Cambios"}
                            </button>
                        </div>
                    )}
                    {activeSection === 'account' && (
                        <div className="settings-section">
                            <h2>Configuración de la Cuenta</h2>
                            <div className="form-group">
                                <label>Nombre de Usuario</label>
                                <input type="text" className="form-input"value={formData.username} onChange={(e) => setFormData(prev => ({ ...prev, username: e.target.value }))}minLength="3"maxLength="20"/>
                            </div>
                            <div className="form-group">
                                <label>Correo Electrónico</label>
                                <input type="email" className="form-input"value={formData.email} onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}/>
                            </div>
                            <button className="btn-primary" onClick={updateAccount}disabled={loading}>
                                {loading ? "Actualizando..." : "Actualizar Datos"}
                            </button>
                        </div>
                    )}
                    {activeSection === 'danger' && (
                        <div className="settings-section danger-section">
                            <h2>Zona Peligrosa</h2>
                            <div className="danger-warning">
                                <h3>Eliminar Cuenta</h3>
                                <p>Esta acción es <strong>irreversible</strong>. Se eliminarán todos tus datos, 
                                    publicaciones, comentarios y cualquier información asociada a tu cuenta.</p>
                                <button className="btn-danger"onClick={deleteAccount}disabled={loading}>
                                    {loading ? "Eliminando..." : "Eliminar Mi Cuenta"}
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

export default UserSettingsPage