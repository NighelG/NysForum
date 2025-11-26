import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { authService } from '../services/authService'
import { useAuth } from '../context/AuthContext'
import Sidebar from '../components/SideBar'
import AvatarTest from '../components/AvatarTest'
import '../styles/UserSettingsPage.css'

function UserSettingsPage() {
    const navigate = useNavigate()
    const { logout } = useAuth()
    const [user, setUser] = useState(null)
    const [activeSection, setActiveSection] = useState('profile')
    const [loading, setLoading] = useState(false)
    const [avatarLoading, setAvatarLoading] = useState(false)
    const [messages, setMessages] = useState({ error: '', success: '' })
    const [formData, setFormData] = useState({
        bio: '',
        first_name: '',
        last_name: '',
        email: ''
    })
    const [avatarFile, setAvatarFile] = useState(null)
    const [avatarTimestamp, setAvatarTimestamp] = useState(Date.now())
    const sections = ['profile', 'personalization', 'account', 'danger']
    const activeIndex = sections.indexOf(activeSection)
    useEffect(() => {
        loadUser()
    }, [])
    const loadUser = async () => {
        try {
            const userData = await authService.getCurrentUser()
            console.log(' Datos del usuario cargados:', userData)
            setUser(userData)
            setFormData({
                bio: userData.bio || '',
                first_name: userData.first_name || '',
                last_name: userData.last_name || '',
                email: userData.email || ''
            })
        } catch (error) {
            console.error(' Error cargando usuario:', error)
            setMessages({ error: 'Error cargando datos del usuario' })
        }
    }
    const getAvatarUrl = () => {
        if (!user) return '/defaultPFP.jpg'
        if (user.avatar) {
            const avatarUrl = `http://localhost:8000/users/profiles/${user.username}/avatar/?t=${avatarTimestamp}`
            console.log(' URL del avatar:', avatarUrl)
            return avatarUrl
        }
        return '/defaultPFP.jpg'
    }
    const handleAvatarError = (e) => {
        console.error(' Error cargando avatar')
        console.error('Elemento img:', e.target)
        console.error('URL que falló:', e.target.src)
        e.target.src = '/defaultPFP.jpg'
    }
    const handleAvatarLoad = () => {
        console.log(' Avatar cargado correctamente')
    }
    const handleLogout = () => {
        logout()
        navigate('/login')
    }
    const validarCorreo = (correo) => {
        const dirrecPopular = /^[a-zA-Z0-9._%+-]+@(gmail\.com|googlemail\.com|hotmail\.com|outlook\.com|live\.com|yahoo\.com|yahoo\.es)$/i
        return dirrecPopular.test(correo)
    }
    const updateProfile = async () => {
        setLoading(true)
        setMessages({ error: '', success: '' })
        try {
            const updateData = {}
            if (formData.bio !== user.bio) updateData.bio = formData.bio
            if (formData.first_name !== user.first_name) updateData.first_name = formData.first_name
            if (formData.last_name !== user.last_name) updateData.last_name = formData.last_name
            if (formData.email !== user.email) {
                if (!validarCorreo(formData.email)) {
                    setMessages({ error: 'Por favor ingresa un correo válido' })
                    setLoading(false)
                    return
                }
                updateData.email = formData.email
            }
            if (Object.keys(updateData).length === 0) {
                setMessages({ error: 'No hay cambios para guardar' })
                setLoading(false)
                return
            }
            const updatedUser = await authService.updateAccount(updateData)
            setMessages({ success: 'Perfil actualizado correctamente' })
            setUser(updatedUser)
        } catch (error) {
            setMessages({ error: error.message || 'Error actualizando perfil' })
        }
        setLoading(false)
    }
    const updateAvatar = async () => {
        if (!avatarFile) {
            setMessages({ error: 'Selecciona una imagen primero' })
            return
        }
        setAvatarLoading(true)
        setMessages({ error: '', success: '' })
        try {
            console.log('Subiendo avatar...', avatarFile)
            const result = await authService.updateAvatar(avatarFile)
            console.log(' Respuesta del servidor:', result)
            setMessages({ success: 'Avatar actualizado correctamente' })
            setAvatarTimestamp(Date.now())
            await loadUser()
            setAvatarFile(null)
        } catch (error) {
            console.error(' Error actualizando avatar:', error)
            setMessages({ error: error.message || 'Error actualizando avatar' })
        }
        setAvatarLoading(false)
    }
    const deleteAccount = async () => {
        if (!window.confirm('¿Estás seguro de que quieres eliminar tu cuenta? Esta acción no se puede deshacer.')) {
            return
        }
        setLoading(true)
        try {
            await authService.deleteProfile()
            localStorage.removeItem('authToken')
            localStorage.removeItem('refreshToken')
            localStorage.removeItem('logueado')
            setMessages({ success: 'Cuenta eliminada correctamente' })
            setTimeout(() => {
                navigate('/login')
            }, 2000)
        } catch (error) {
            setMessages({ error: error.message || 'Error eliminando cuenta' })
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
        setAvatarFile(file)
    }
    const forceReloadAvatar = () => {
        console.log('Forzando recarga de avatar...')
        setAvatarTimestamp(Date.now())
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
            <Sidebar />
            <div className="settings-container">
                <header className="settings-header">
                    <nav className="settings-tabs">
                        <button className={`settings-tab ${activeSection === "profile" ? "active" : ""}`} onClick={() => setActiveSection("profile")}>
                            Perfil
                        </button>
                        <button className={`settings-tab ${activeSection === "personalization" ? "active" : ""}`} onClick={() => setActiveSection("personalization")}>
                            Personalización
                        </button>
                        <button className={`settings-tab ${activeSection === "account" ? "active" : ""}`} onClick={() => setActiveSection("account")}>
                            Cuenta
                        </button>
                        <button className={`settings-tab danger ${activeSection === "danger" ? "active" : ""}`} onClick={() => setActiveSection("danger")}>
                            Zona Peligrosa
                        </button>
                    </nav>
                </header>
                <div className="settings-content">
                    <div className="settings-carousel" style={{ transform: `translateX(-${activeIndex * 100}%)` }}>
                        <div className="settings-section">
                            <h2>Información del Perfil</h2>
                            {messages.error && (
                                <div className="alert alert-error">{messages.error}</div>
                            )}
                            {messages.success && (
                                <div className="alert alert-success">{messages.success}</div>
                            )}
                            <div className="profile-info">
                                <img src={getAvatarUrl()} alt="Avatar" className="profile-picture" onError={handleAvatarError} onLoad={handleAvatarLoad} 
                                crossOrigin="anonymous" key={`avatar-${avatarTimestamp}`}/>
                                <div className="profile-details">
                                    <h3>{user.username}</h3>
                                    <p className="profile-bio">{user.bio || "Sin biografía"}</p>
                                    <p className="profile-email">{user.email}</p>
                                    <p className="profile-stats">Publicaciones: {user.posts_count || 0} | Comentarios: {user.comments_count || 0}</p>
                                    <p className="profile-join-date"> Miembro desde: {new Date(user.date_joined).toLocaleDateString()}</p>
                                    <p className="profile-role">Rol: {user.role}</p>
                                    <p className="profile-status">Estado: {user.status}</p>
                                    <div style={{ marginTop: '10px' }}>
                                        <button onClick={forceReloadAvatar}className="btn-primary"style={{ fontSize: '12px', padding: '5px 10px' }}>Recargar Avatar</button>
                                    </div>
                                    <div className="logout-section">
                                        <button className="btn-logout" onClick={handleLogout}>Cerrar Sesión</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="settings-section">
                            <h2>Personalización</h2>
                            {messages.error && (
                                <div className="alert alert-error">{messages.error}</div>
                            )}
                            {messages.success && (
                                <div className="alert alert-success">{messages.success}</div>
                            )}
                            <div className="form-group">
                                <label>Avatar Actual</label>
                                <div className="current-image">
                                    <img src={getAvatarUrl()} alt="Preview" className="image-preview" onError={handleAvatarError}
                                    onLoad={handleAvatarLoad} crossOrigin="anonymous"key={`avatar-preview-${avatarTimestamp}`}/>
                                </div>
                                <label>Subir Nuevo Avatar</label>
                                <input 
                                    type="file" 
                                    className="form-input" 
                                    accept="image/jpeg,image/png,image/gif,image/webp" 
                                    onChange={handleImageUpload} 
                                />
                                {avatarFile && (
                                    <div>
                                        <p>Nueva imagen seleccionada: {avatarFile.name}</p>
                                        <button 
                                            className="btn-primary" 
                                            onClick={updateAvatar}
                                            disabled={avatarLoading}
                                            style={{marginTop: '10px'}}
                                        >
                                            {avatarLoading ? "Subiendo..." : "Subir Avatar"}
                                        </button>
                                    </div>
                                )}
                            </div>
                            <div className="form-group">
                                <label>Biografía</label>
                                <textarea className="form-textarea"value={formData.bio} onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
                                    placeholder="Cuéntanos algo sobre ti..."rows="4"maxLength="500"/>
                                <p className="form-help">{formData.bio.length}/500 caracteres</p>
                            </div>
                            <button className="btn-primary" onClick={updateProfile}disabled={loading}>
                                {loading ? "Guardando..." : "Guardar Cambios en Biografía"}
                            </button>
                        </div>
                        <div className="settings-section">
                            <h2>Configuración de la Cuenta</h2>
                            {messages.error && (
                                <div className="alert alert-error">{messages.error}</div>
                            )}
                            {messages.success && (
                                <div className="alert alert-success">{messages.success}</div>
                            )}
                            <div className="form-group">
                                <label>Nombre</label>
                                <input type="text" className="form-input"value={formData.first_name} onChange={(e) => setFormData(prev => ({ ...prev, first_name: e.target.value }))}placeholder="Tu nombre"/>
                            </div>

                            <div className="form-group">
                                <label>Apellido</label>
                                <input type="text" className="form-input"value={formData.last_name} onChange={(e) => setFormData(prev => ({ ...prev, last_name: e.target.value }))}placeholder="Tu apellido"/>
                            </div>
                            <div className="form-group">
                                <label>Correo Electrónico</label>
                                <input type="email" className="form-input"value={formData.email} onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}/>
                            </div>
                            <button className="btn-primary" onClick={updateProfile}disabled={loading}>
                                {loading ? "Actualizando..." : "Actualizar Datos"}
                            </button>
                        </div>
                        <div className="settings-section danger-section">
                            <h2>Zona Peligrosa</h2>
                            {messages.error && (
                                <div className="alert alert-error">{messages.error}</div>
                            )}
                            {messages.success && (
                                <div className="alert alert-success">{messages.success}</div>
                            )}
                            <div className="danger-warning">
                                <h3>Eliminar Cuenta</h3>
                                <p>Esta acción es <strong>irreversible</strong>. Se eliminarán todos tus datos, 
                                    publicaciones, comentarios y cualquier información asociada a tu cuenta.</p>
                                <button className="btn-danger" onClick={deleteAccount}disabled={loading}>
                                    {loading ? "Eliminando..." : "Eliminar Mi Cuenta"}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            {/* Descomentar si desea probarlo mas no aporta mucho al producto final */}
            {/* <AvatarTest /> */}
        </div>
    )
}

export default UserSettingsPage