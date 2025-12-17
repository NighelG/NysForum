import React, { useEffect, useState, useCallback, useMemo, useReducer } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useApi } from '../hooks/useApi'
import Sidebar from '../components/SideBar'
import UserProfilePopup from '../components/principal/UserProfilePopup'
import ReportCard from '../components/moderacion/ReportCard'
import HistoryItem from '../components/moderacion/HistoryItem'
import CategoryManager from '../components/moderacion/CategoryManager'
import UserManager from '../components/moderacion/UserManager'
import { SECTIONS, CATEGORIES, initialState, stateReducer, getStatusLabel, generateUniqueKey } from '../utils/moderationUtils'
import { useModerationData } from '../hooks/useModerationData'
import { useModerationState } from '../hooks/useModerationState'
import '../styles/ModerationMenu.css'

function ModerationMenu() {
    const { user } = useAuth()
    const navigate = useNavigate()
    const { execute, loading } = useApi()
    
    const [isProfilePopupOpen, setIsProfilePopupOpen] = useState(false)
    const [state, dispatch] = useReducer(stateReducer, initialState)
    const { activeSection, filters, reports, stats, history, resolving, resolveData } = state

    const isAdmin = useMemo(() => {
        if (!user || user.isGuest) return false
        return ['admin', 'true_admin'].includes(user.role)
    }, [user])

    const { loadReports, loadStats, loadHistory, resolveReport } = useModerationData(
        isAdmin, 
        execute, 
        navigate
    )
    
    const {
        handleResolveActionChange,
        handleResolveNotesChange,
        handleFilterChange,
        handleSectionChange
    } = useModerationState(dispatch, isAdmin)

    const allActions = useMemo(() => {
        const postActions = (history.posts || []).map((action, index) => ({
            ...action,
            _type: 'post',
            _uniqueKey: generateUniqueKey(action, 'post', index)
        }))
        
        const commentActions = (history.comments || []).map((action, index) => ({
            ...action,
            _type: 'comment',
            _uniqueKey: generateUniqueKey(action, 'comment', index)
        }))
        
        return [...postActions, ...commentActions]
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    }, [history.posts, history.comments])

    const fetchReports = useCallback(async () => {
        try {
            const data = await loadReports(filters)
            if (data) {
                dispatch({
                    type: 'SET_REPORTS',
                    payload: {
                        posts: data.post_reports || [],
                        comments: data.comment_reports || [],
                        total: data.total || 0
                    }
                })
            }
        } catch (error) {
            console.error('Error fetching reports:', error)
        }
    }, [loadReports, filters])
    
    const fetchStats = useCallback(async () => {
        try {
            const data = await loadStats()
            if (data) {
                dispatch({ type: 'SET_STATS', payload: data })
            }
        } catch (error) {
            console.error('Error fetching stats:', error)
        }
    }, [loadStats])
    
    const fetchHistory = useCallback(async () => {
        try {
            const data = await loadHistory()
            if (data) {
                dispatch({
                    type: 'SET_HISTORY',
                    payload: data
                })
            }
        } catch (error) {
            console.error('Error fetching history:', error)
        }
    }, [loadHistory])

    useEffect(() => {
        if (!isAdmin) {
            navigate('/forum')
            return
        }
        
        const loadData = {
            'pending': fetchReports,
            'stats': fetchStats,
            'history': fetchHistory
        }[activeSection]
        
        if (loadData) loadData()
    }, [activeSection, isAdmin, fetchReports, fetchStats, fetchHistory, navigate])

    const handleResolve = useCallback(async (reportType, reportId) => {
        if (!resolveData.action) return
        
        dispatch({ type: 'SET_RESOLVING', payload: `${reportType}-${reportId}` })
        
        try {
            await resolveReport(reportType, reportId, {
                status: resolveData.action === 'reviewed' ? 'reviewed' : 
                        resolveData.action === 'dismissed' ? 'dismissed' : 'resolved',
                action: resolveData.action,
                notes: resolveData.notes
            })
            
            dispatch({ type: 'RESET_RESOLVE_FORM' })
            
            if (activeSection === 'pending') fetchReports()
            if (activeSection === 'stats') fetchStats()
            
        } catch (error) {
            console.error('Error resolving report:', error)
            dispatch({ type: 'SET_RESOLVING', payload: null })
        }
    }, [resolveData, resolveReport, activeSection, fetchReports, fetchStats])
    
    const toggleProfilePopup = useCallback(() => {
        if (!isAdmin) return
        setIsProfilePopupOpen(prev => !prev)
    }, [isAdmin])

    const renderStatsSection = () => {
        if (!stats) return <p className="loading-text">Cargando estadísticas...</p>
        
        return (
            <div className="stats-container">
                <div className="stats-cards">
                    <div className="stat-card">
                        <h3>Reportes Totales</h3>
                        <p className="stat-number">{stats.stats?.total_reports || 0}</p>
                    </div>
                    <div className="stat-card">
                        <h3>Pendientes</h3>
                        <p className="stat-number">{stats.stats?.total_pending || 0}</p>
                    </div>
                    <div className="stat-card">
                        <h3>Resueltos Hoy</h3>
                        <p className="stat-number">{stats.stats?.resolved_today || 0}</p>
                    </div>
                    <div className="stat-card">
                        <h3>Posts Reportados</h3>
                        <p className="stat-number">{stats.stats?.total_post_reports || 0}</p>
                    </div>
                </div>
                
                <div className="stats-details">
                    <div className="stats-section">
                        <h4>Reportes de Posts</h4>
                        <ul>
                            {stats.post_reports_by_status?.map((item, index) => (
                                <li key={`post-status-${index}-${item.status}`}>
                                    <span className="stat-label">{getStatusLabel(item.status)}</span>
                                    <span className="stat-value">{item.count}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                    
                    <div className="stats-section">
                        <h4>Reportes de Comentarios</h4>
                        <ul>
                            {stats.comment_reports_by_status?.map((item, index) => (
                                <li key={`comment-status-${index}-${item.status}`}>
                                    <span className="stat-label">{getStatusLabel(item.status)}</span>
                                    <span className="stat-value">{item.count}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </div>
        )
    }

    const renderHistorySection = () => {
        if (loading && allActions.length === 0) {
            return <p className="loading-text">Cargando historial</p>
        }
        
        if (allActions.length === 0) {
            return (
                <div className="no-history">
                    <p>No hay historial de acciones</p>
                    <p className="subtext">Las acciones de moderación aparecerán aquí cuando resuelvas reportes.</p>
                </div>
            )
        }
        
        return (
            <div className="history-container">
                <div className="history-stats">
                    <span>Posts: {history.posts?.length || 0}</span>
                    <span>Comentarios: {history.comments?.length || 0}</span>
                    <span>Total: {allActions.length}</span>
                </div>
                
                {allActions.slice(0, 50).map(action => (
                    <HistoryItem key={action._uniqueKey} action={action} />
                ))}
            </div>
        )
    }

    const renderPendingReportsSection = () => (
        <div className="moderation-section">
            <div className="section-header">
                <h2>Reportes Pendientes ({reports.total})</h2>
                <div className="filters">
                    <select value={filters.type} onChange={(e) => handleFilterChange('type', e.target.value)} className="filter-select">
                        <option value="all">Todos los tipos</option>
                        <option value="post">Solo posts</option>
                        <option value="comment">Solo comentarios</option>
                    </select>
                    
                    <select value={filters.category} onChange={(e) => handleFilterChange('category', e.target.value)}  className="filter-select">
                        <option value="all">Todas las categorías</option>
                        {CATEGORIES.map((cat, index) => (
                            <option key={`cat-${index}-${cat.value}`} value={cat.value}>
                                {cat.label}
                            </option>
                        ))}
                    </select>
                    <button onClick={fetchReports} className="btn-refresh" disabled={loading}>{loading ? 'Cargando...' : 'Actualizar'}</button>
                </div>
            </div>
            
            {loading && reports.total === 0 ? (
                <p className="loading-text">Cargando reportes...</p>
            ) : reports.total === 0 ? (
                <div className="no-reports">
                    <p>¡No hay reportes pendientes!</p>
                    <p>Todos los reportes han sido procesados.</p>
                </div>
            ) : (
                <div className="reports-list">
                    {reports.posts.map((report, index) => (
                        <ReportCard
                            key={`post-${report.id}`}
                            report={report}
                            type="post"
                            index={index}
                            isResolving={resolving === `post-${report.id}`}
                            resolveData={resolveData}
                            onActionChange={handleResolveActionChange}
                            onNotesChange={handleResolveNotesChange}
                            onResolve={() => handleResolve('post', report.id)}
                        />
                    ))}
                    {reports.comments.map((report, index) => (
                        <ReportCard
                            key={`comment-${report.id}`}
                            report={report}
                            type="comment"
                            index={index}
                            isResolving={resolving === `comment-${report.id}`}
                            resolveData={resolveData}
                            onActionChange={handleResolveActionChange}
                            onNotesChange={handleResolveNotesChange}
                            onResolve={() => handleResolve('comment', report.id)}
                        />
                    ))}
                </div>
            )}
        </div>
    )

    const renderCategoriesSection = () => (
        <div className="moderation-section">
            <CategoryManager isAdmin={isAdmin} />
        </div>
    )

    const renderUsersSection = () => (
        <div className="moderation-section">
            <UserManager isAdmin={isAdmin} />
        </div>
    )

    if (!isAdmin) {
        return (
            <div className="moderation-menu-page">
                <Sidebar />
                <div className="main-content">
                    <div className="access-denied">
                        <h2>Acceso Restringido</h2>
                        <p>Esta sección solo está disponible para administradores.</p>
                        <p>Tu rol actual: <strong>{user?.role || 'user'}</strong></p>
                        <button onClick={() => navigate('/forum')} className="btn-back">Volver al Foro</button>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="moderation-menu-page">
            {isProfilePopupOpen && <UserProfilePopup onClose={toggleProfilePopup} />}
            <Sidebar onProfileClick={toggleProfilePopup} />
            <div className="main-content">
                <div className="admin-header">
                    <h1>Panel de Administración</h1>
                    <p className="admin-subtitle">
                        Bienvenido, <strong>{user?.username || 'Administrador'}</strong>. 
                        Rol: <span className="admin-role">{user?.role || 'admin'}</span>
                    </p>
                </div>
                <div className="moderation-container">
                    <header className="moderation-header">
                        <nav className="moderation-tabs">
                            {SECTIONS.map(section => (
                                <button key={`tab-${section.id}`} className={`moderation-tab ${activeSection === section.id ? 'active' : ''}`} onClick={() => handleSectionChange(section.id)}>
                                    {section.label}
                                </button>
                            ))}
                            <button key="tab-users" className={`moderation-tab ${activeSection === 'users' ? 'active' : ''}`} onClick={() => handleSectionChange('users')}>
                                Gestión de Usuarios
                            </button>
                        </nav>
                    </header>
                    <div className="moderation-content">
                        {activeSection === 'pending' && renderPendingReportsSection()}
                        {activeSection === 'history' && (
                            <div className="moderation-section">
                                <div className="section-header">
                                    <h2>Historial de Acciones</h2>
                                    <button onClick={fetchHistory} className="btn-refresh" disabled={loading}>{loading ? 'Cargando...' : 'Actualizar'}</button>
                                </div>
                                {renderHistorySection()}
                            </div>
                        )}
                        {activeSection === 'stats' && (
                            <div className="moderation-section">
                                <div className="section-header">
                                    <h2>Estadísticas de Moderación</h2>
                                    <button onClick={fetchStats} className="btn-refresh" disabled={loading}>{loading ? 'Cargando...' : 'Actualizar'}</button>
                                </div>
                                {renderStatsSection()}
                            </div>
                        )}
                        {activeSection === 'categories' && renderCategoriesSection()}
                        {activeSection === 'users' && renderUsersSection()}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default ModerationMenu