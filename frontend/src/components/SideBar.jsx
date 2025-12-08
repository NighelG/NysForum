import React, { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import '../styles/Sidebar.css'

function SideBar() {
    const navigate = useNavigate()
    const location = useLocation()
    const { user } = useAuth()
    const [isCollapsed, setIsCollapsed] = useState(true)

    const isAdmin = React.useMemo(() => {
        if (!user || user.isGuest) return false
        return ['admin', 'true_admin'].includes(user.role)
    }, [user])
    
    const menuItems = [
        { id: 'forum', label: 'Foro', path: '/forum', icon: '/home.png' },
        { id: 'settings', label: 'Configuración', path: '/settings', icon: '/settings.png' },
        ...(isAdmin ? [
            { id: 'moderation', label: 'Moderación', path: '/moderation', icon: '/shield.png' }
        ] : [])
    ]
    
    const handleNavigation = (path) => {
        if (path !== '#') {
            navigate(path)
        }
    }
    
    const toggleSidebar = () => {
        setIsCollapsed(!isCollapsed)
    }
    
    return (
        <>
            <div className={`sidebar ${isCollapsed ? 'collapsed' : ''}`}>
                <div className="sidebar-header"><img src="/nys-nice-forum.png" alt="NysForum" className="sidebar-logo" /></div>
                <nav className="sidebar-nav">
                    {menuItems.map((item) => (
                        <button key={item.id} className={`nav-item ${location.pathname === item.path ? 'active' : ''} ${item.path === '#' ? 'disabled' : ''}`}
                            onClick={() => handleNavigation(item.path)} disabled={item.path === '#'} title={isCollapsed ? item.label : ''}>
                            <img src={item.icon} alt={item.label} className='icono-negro'/>
                            {!isCollapsed && <span className="nav-label">{item.label}</span>}
                        </button>
                    ))}
                </nav>
                {!isCollapsed && user && (
                    <div className="sidebar-footer">
                        <p className="sidebar-version">Que ondas</p>
                        <div className="user-info-sidebar">
                            <p className="user-name">{user.username}</p>
                            <p className="user-role">
                                Rol: <span className={`role-badge ${user.role}`}>
                                    {user.role}
                                </span>
                            </p>
                            {isAdmin && (
                                <p className="admin-access">Acceso a moderación</p>
                            )}
                        </div>
                    </div>
                )}
            </div>
            <button className={`sidebar-toggle ${isCollapsed ? 'collapsed' : ''}`} onClick={toggleSidebar} title={isCollapsed ? "Expandir sidebar" : "Colapsar sidebar"}>
                {isCollapsed ? (
                    <img className='icono-negro' src="/menu.png" alt="Menú" />
                ) : (
                    <img className='icono-negro' src="/left.png" alt="Cerrar" />
                )}
            </button>
        </>
    )
}

export default SideBar