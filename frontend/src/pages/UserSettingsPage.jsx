import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { authService } from '../services/authService'
import { useAuth } from '../context/AuthContext'
import Sidebar from '../components/SideBar'
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
    useEffect(() => { loadUser() }, [])
    const setMsg = (err = '', ok = '') => setMessages({ error: err, success: ok })
    const loadUser = async () => {
        try {
            const data = await authService.getCurrentUser()
            setUser(data)
            setFormData({
                bio: data.bio || '',
                first_name: data.first_name || '',
                last_name: data.last_name || '',
                email: data.email || ''
            })
        } catch {
            setMsg('Error cargando datos del usuario')
        }
    }
    const getAvatarUrl = () =>
        user?.avatar
            ? `http://localhost:8000/users/profiles/${user.username}/avatar/?t=${avatarTimestamp}`
            : '/defaultPFP.jpg'
    const validarCorreo = correo =>
        /^[a-zA-Z0-9._%+-]+@(gmail\.com|googlemail\.com|hotmail\.com|outlook\.com|live\.com|yahoo\.com|yahoo\.es)$/i
            .test(correo)
    const updateProfile = async () => {
        setLoading(true)
        setMsg()
        const updateData = Object.fromEntries(
            Object.entries(formData).filter(([key, val]) => val !== user[key])
        )
        if (updateData.email && !validarCorreo(updateData.email)) {
            setMsg('Por favor ingresa un correo válido')
            return setLoading(false)
        }
        if (!Object.keys(updateData).length) {
            setMsg('No hay cambios para guardar')
            return setLoading(false)
        }
        try {
            const updated = await authService.updateAccount(updateData)
            setUser(updated)
            setMsg('', 'Perfil actualizado correctamente')
        } catch (e) {
            setMsg(e.message || 'Error actualizando perfil')
        }
        setLoading(false)
    }
    const updateAvatar = async () => {
        if (!avatarFile) return setMsg('Selecciona una imagen primero')
        setAvatarLoading(true)
        setMsg()
        try {
            await authService.updateAvatar(avatarFile)
            setAvatarTimestamp(Date.now())
            await loadUser()
            setAvatarFile(null)
            setMsg('', 'Avatar actualizado correctamente')
        } catch (e) {
            setMsg(e.message || 'Error actualizando avatar')
        }
        setAvatarLoading(false)
    }
    const deleteAccount = async () => {
        if (!window.confirm('¿Estás seguro de que quieres eliminar tu cuenta? Esta acción no se puede deshacer.')) return
        setLoading(true)
        try {
            await authService.deleteProfile()
            localStorage.removeItem('authToken')
            localStorage.removeItem('refreshToken')
            localStorage.removeItem('logueado')
            setMsg('', 'Cuenta eliminada correctamente')
            setTimeout(() => navigate('/login'), 2000)
        } catch (e) {
            setMsg(e.message || 'Error eliminando cuenta')
            setLoading(false)
        }
    }
    const handleImageUpload = e => {
        const file = e.target.files[0]
        if (!file) return
        if (!file.type.startsWith('image/')) return setMsg('El archivo debe ser una imagen')
        if (file.size > 5 * 1024 * 1024) return setMsg('La imagen no debe pesar más de 5MB')
        setAvatarFile(file)
    }
    const forceReloadAvatar = () => setAvatarTimestamp(Date.now())
    const handleLogout = () => {
        logout()
        navigate('/login')
    }
    if (!user)
        return (
            <div className="user-settings-page">
                <div className="loading-container">
                    <p>Cargando información del usuario...</p>
                </div>
            </div>
        )
    return (
        <div className="user-settings-page">
            <Sidebar />
            <div className="settings-container">
                <header className="settings-header">
                    <nav className="settings-tabs">
                        {sections.map(s => (
                            <button key={s}className={`settings-tab ${s === 'danger' ? 'danger' : ''} ${activeSection === s ? 'active' : ''}`}onClick={() => setActiveSection(s)}>
                                {s === 'profile' && 'Perfil'}
                                {s === 'personalization' && 'Personalización'}
                                {s === 'account' && 'Cuenta'}
                                {s === 'danger' && 'Zona Peligrosa'}
                            </button>
                        ))}
                    </nav>
                </header>

                <div className="settings-content">
                    <div className="settings-carousel" style={{ transform: `translateX(-${activeIndex * 100}%)` }}>
                        <div className="settings-section">
                            <h2>Información del Perfil</h2>
                            {messages.error && <div className="alert alert-error">{messages.error}</div>}
                            {messages.success && <div className="alert alert-success">{messages.success}</div>}
                            <div className="profile-info">
                                <img src={getAvatarUrl()} alt="Avatar" className="profile-picture" onError={e => e.target.src = '/defaultPFP.jpg'}key={`avatar-${avatarTimestamp}`}crossOrigin="anonymous"/>
                                <div className="profile-details">
                                    <h3>{user.username}</h3>
                                    <p className="profile-bio">{user.bio || "Sin biografía"}</p>
                                    <p className="profile-email">{user.email}</p>
                                    <p className="profile-stats">Publicaciones: {user.posts_count || 0} | Comentarios: {user.comments_count || 0}</p>
                                    <p className="profile-join-date">Miembro desde: {new Date(user.date_joined).toLocaleDateString()}</p>
                                    <p className="profile-role">Rol: {user.role}</p>
                                    <p className="profile-status">Estado: {user.status}</p>
                                    <div style={{ marginTop: '10px' }}>
                                        <button className="btn-primary"onClick={forceReloadAvatar}style={{ fontSize: '12px', padding: '5px 10px' }}>Recargar Avatar</button>
                                    </div>
                                    <div className="logout-section">
                                        <button className="btn-logout" onClick={handleLogout}>Cerrar Sesión</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="settings-section">
                            <h2>Personalización</h2>
                            {messages.error && <div className="alert alert-error">{messages.error}</div>}
                            {messages.success && <div className="alert alert-success">{messages.success}</div>}
                            <div className="form-group">
                                <label>Avatar Actual</label>
                                <div className="current-image">
                                    <img src={getAvatarUrl()} alt="Preview" className="image-preview" onError={e => e.target.src = '/defaultPFP.jpg'}
                                        key={`avatar-preview-${avatarTimestamp}`} crossOrigin="anonymous"/>
                                </div>
                                <label>Subir Nuevo Avatar</label>
                                <input type="file" className="form-input" accept="image/jpeg,image/png,image/gif,image/webp" onChange={handleImageUpload}/>
                                {avatarFile && (
                                    <div>
                                        <p>Nueva imagen seleccionada: {avatarFile.name}</p>
                                        <button className="btn-primary" onClick={updateAvatar} disabled={avatarLoading} style={{ marginTop: '10px' }}> {avatarLoading ? "Subiendo..." : "Subir Avatar"} </button>
                                    </div>
                                )}
                            </div>
                            <div className="form-group">
                                <label>Biografía</label>
                                <textarea className="form-textarea" value={formData.bio} onChange={e => setFormData(prev => ({ ...prev, bio: e.target.value }))} 
                                    placeholder="Cuéntanos algo sobre ti..."rows="4"maxLength="500"/>
                                <p className="form-help">{formData.bio.length}/500 caracteres</p>
                            </div>
                            <button className="btn-primary" onClick={updateProfile} disabled={loading}>{loading ? "Guardando..." : "Guardar Cambios en Biografía"}</button>
                        </div>
                        <div className="settings-section">
                            <h2>Configuración de la Cuenta</h2>
                            {messages.error && <div className="alert alert-error">{messages.error}</div>}
                            {messages.success && <div className="alert alert-success">{messages.success}</div>}
                            <div className="form-group">
                                <label>Nombre</label>
                                <input type="text" className="form-input"value={formData.first_name}onChange={e => setFormData(prev => ({ ...prev, first_name: e.target.value }))}/>
                            </div>
                            <div className="form-group">
                                <label>Apellido</label>
                                <input type="text"className="form-input"value={formData.last_name}onChange={e => setFormData(prev => ({ ...prev, last_name: e.target.value }))}/>
                            </div>
                            <div className="form-group">
                                <label>Correo Electrónico</label>
                                <input type="email" className="form-input"value={formData.email}onChange={e => setFormData(prev => ({ ...prev, email: e.target.value }))}/>
                            </div>
                            <button className="btn-primary" onClick={updateProfile} disabled={loading}>{loading ? "Actualizando..." : "Actualizar Datos"}</button>
                        </div>
                        <div className="settings-section danger-section">
                            <h2>Zona Peligrosa</h2>
                            {messages.error && <div className="alert alert-error">{messages.error}</div>}
                            {messages.success && <div className="alert alert-success">{messages.success}</div>}
                            <div className="danger-warning">
                                <h3>Eliminar Cuenta</h3>
                                <p>Esta acción es <strong>irreversible</strong>. Se eliminarán todos tus datos, publicaciones y comentarios.</p>
                                <button className="btn-danger" onClick={deleteAccount} disabled={loading}>{loading ? "Eliminando..." : "Eliminar Mi Cuenta"}</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default UserSettingsPage
