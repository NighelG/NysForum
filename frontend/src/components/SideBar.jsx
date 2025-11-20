import React, { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import '../styles/Sidebar.css'

function SideBar() {
    const navigate = useNavigate()
    const location = useLocation()
    const [isCollapsed, setIsCollapsed] = useState(true)
    const menuItems = [
        { id: 'forum', label: 'Foro', path: '/forum', icon: '/home.png'},
        { id: 'settings', label: 'Configuración', path: '/settings', icon: '/settings.png'}
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
                <div className="sidebar-header">
                    <img src="/nysforum-high-resolution-logo-transparent(1).png" alt="NysForum" className="sidebar-logo" />
                </div>
                <nav className="sidebar-nav">
                    {menuItems.map((item) => (
                        <button key={item.id} className={`nav-item ${location.pathname === item.path ? 'active' : ''} ${item.path === '#' ? 'disabled' : ''}`}
                        onClick={() => handleNavigation(item.path)} disabled={item.path === '#'} title={isCollapsed ? item.label : ''}>
                                <img src={item.icon} alt={item.label}className="nav-icon-img"/>
                            {!isCollapsed && <span className="nav-label">{item.label}</span>}
                        </button>
                    ))}
                </nav>
                {!isCollapsed && (
                    <div className="sidebar-footer">
                        <p className="sidebar-version">Que ondas</p>
                    </div>
                )}
            </div>
            <button className={`sidebar-toggle ${isCollapsed ? 'collapsed' : ''}`} onClick={toggleSidebar}title={isCollapsed ? "Expandir sidebar" : "Colapsar sidebar"} >
                {isCollapsed ? <img src="/menu.png" alt="" /> : <img src="/left.png" alt="" />}
            </button>
        </>
    )
}

export default SideBar