import React, { useState, useEffect, useRef } from 'react'
import { getStatusLabel, getRoleLabel, getStatusOptions, getRoleOptions } from '../../utils/userUtils'
import '../../styles/UserActionsMenu.css'

const UserActionsMenu = ({ user, currentUser, onEdit, onChangeStatus, onChangeRole, onDelete, position = 'bottom-right' }) => {
    const [isOpen, setIsOpen] = useState(false)
    const [activeModal, setActiveModal] = useState(null)
    const [formData, setFormData] = useState({})
    const [reason, setReason] = useState('')
    const [loading, setLoading] = useState(false)
    const menuRef = useRef(null)
    const buttonRef = useRef(null)

    const canEdit = currentUser && user && 
    currentUser.username !== user.username &&
    (currentUser.role === 'admin' || currentUser.role === 'true_admin')
    
    const canDelete = canEdit && 
    (user.role !== 'admin' && user.role !== 'true_admin')

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (isOpen && 
                menuRef.current && 
                !menuRef.current.contains(event.target) && 
                buttonRef.current && 
                !buttonRef.current.contains(event.target)) {
                setIsOpen(false)
            }
        }
        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside)
            document.body.style.overflow = 'hidden'
        } else {
            document.body.style.overflow = ''
        }
        
        return () => {
            document.removeEventListener('mousedown', handleClickOutside)
            document.body.style.overflow = ''
        }
    }, [isOpen])

    const handleModalOpen = (modalType, initialData = {}) => {
        setActiveModal(modalType)
        setFormData(initialData)
        setReason('')
        setIsOpen(false)
    }

    const handleEditSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)
        try {
            await onEdit(user.username, formData)
            setActiveModal(null)
        } catch (err) {
            console.error('Error editing user:', err)
            alert('Error al editar usuario: ' + err.message)
        } finally {
            setLoading(false)
        }
    }

    const handleStatusSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)
        try {
            await onChangeStatus(user.username, formData.status, reason)
            setActiveModal(null)
        } catch (err) {
            console.error('Error changing status:', err)
            alert('Error al cambiar estado: ' + err.message)
        } finally {
            setLoading(false)
        }
    }

    const handleRoleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)
        try {
            await onChangeRole(user.username, formData.role)
            setActiveModal(null)
        } catch (err) {
            console.error('Error changing role:', err)
            alert('Error al cambiar rol: ' + err.message)
        } finally {
            setLoading(false)
        }
    }

    const handleDeleteSubmit = async (e) => {
        e.preventDefault()
        if (!reason.trim()) {
            alert('Debe proporcionar un motivo para la eliminación')
            return
        }
        
        if (!window.confirm(`¿Está seguro de eliminar al usuario ${user.username}?`)) {
            return
        }
        
        setLoading(true)
        try {
            await onDelete(user.username, reason)
            setActiveModal(null)
        } catch (err) {
            console.error('Error deleting user:', err)
            alert('Error al eliminar usuario: ' + err.message)
        } finally {
            setLoading(false)
        }
    }

    const positionClasses = {
        'bottom-right': 'menu-bottom-right',
        'bottom-left': 'menu-bottom-left',
        'top-right': 'menu-top-right',
        'top-left': 'menu-top-left'
    }

    return (
        <>
            <div className="user-actions-menu-container">
                <button 
                    ref={buttonRef}
                    className="menu-toggle-btn"
                    onClick={() => setIsOpen(!isOpen)}
                    title="Acciones"
                >
                    ⋮
                </button>
                
                {isOpen && (
                    <div ref={menuRef} className={`actions-menu-dropdown ${positionClasses[position]}`}>
                        <button className="dropdown-item edit-item"
                            onClick={() => handleModalOpen('edit', {
                                email: user.email || '',
                                bio: user.bio || '',
                                first_name: user.first_name || '',
                                last_name: user.last_name || ''
                            })}> <img className='icono-negro' src="/edit.png" alt="" /> Editar información</button>
                        
                        {canEdit && (
                            <>
                                <button className="dropdown-item status-item"onClick={() => handleModalOpen('status', { status: user.status })}> 
                                    <img className='icono-negro' src="/user_status.png" alt="" /> Cambiar estado</button>
                                <button className="dropdown-item role-item"onClick={() => handleModalOpen('role', { role: user.role })}> 
                                    <img className='icono-negro' src="user_role.png" alt="" /> Cambiar rol</button>
                            </>
                        )}
                        
                        {canDelete && (
                            <button className="dropdown-item delete-item"onClick={() => handleModalOpen('delete')}>
                                <img className='icono-negro' src="user_remove.png" alt="" /> Eliminar usuario</button>
                        )}
                    </div>
                )}
            </div>
            
            {activeModal === 'edit' && (
                <div className="action-modal-overlay" onClick={() => setActiveModal(null)}>
                    <div className="action-modal" onClick={(e) => e.stopPropagation()}>
                        <h3>Editar Información - {user.username}</h3>
                        <form onSubmit={handleEditSubmit}>
                            <div className="form-group">
                                <label>Correo electrónico</label>
                                <input type="email" value={formData.email || ''} onChange={(e) => setFormData({...formData, email: e.target.value})} className="form-input"/>
                            </div>
                            
                            <div className="form-group">
                                <label>Nombre</label>
                                <input type="text" value={formData.first_name || ''} onChange={(e) => setFormData({...formData, first_name: e.target.value})} className="form-input"/>
                            </div>
                            
                            <div className="form-group">
                                <label>Apellido</label>
                                <input type="text" value={formData.last_name || ''} onChange={(e) => setFormData({...formData, last_name: e.target.value})} className="form-input"/>
                            </div>
                            <div className="form-group">
                                <label>Biografía</label>
                                <textarea value={formData.bio || ''} onChange={(e) => setFormData({...formData, bio: e.target.value})} className="form-textarea" rows="4" placeholder="Descripción del usuario..."/>
                            </div>
                            
                            <div className="modal-actions">
                                <button type="button" onClick={() => setActiveModal(null)}>Cancelar</button>
                                <button type="submit" className="primary" disabled={loading}>{loading ? 'Guardando...' : 'Guardar Cambios'}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
            
            {activeModal === 'status' && (
                <div className="action-modal-overlay" onClick={() => setActiveModal(null)}>
                    <div className="action-modal" onClick={(e) => e.stopPropagation()}>
                        <h3>Cambiar Estado - {user.username}</h3>
                        <form onSubmit={handleStatusSubmit}>
                            <div className="form-group">
                                <label>Estado actual: <strong>{getStatusLabel(user.status)}</strong></label>
                                <select value={formData.status || user.status} onChange={(e) => setFormData({...formData, status: e.target.value})} className="form-select">
                                    {getStatusOptions().map(option => (
                                        <option key={option.value} value={option.value}>{option.label}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Motivo (opcional)</label>
                                <textarea value={reason} onChange={(e) => setReason(e.target.value)}placeholder="Razón del cambio de estado..."rows="3"/>
                            </div>
                            <div className="modal-actions">
                                <button type="button" onClick={() => setActiveModal(null)}>Cancelar</button>
                                <button type="submit" className="primary" disabled={loading}>{loading ? 'Aplicando...' : 'Aplicar Cambio'}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
            
            {activeModal === 'role' && (
                <div className="action-modal-overlay" onClick={() => setActiveModal(null)}>
                    <div className="action-modal" onClick={(e) => e.stopPropagation()}>
                        <h3>Cambiar Rol - {user.username}</h3>
                        <form onSubmit={handleRoleSubmit}>
                            <div className="form-group">
                                <label>Rol actual: <strong>{getRoleLabel(user.role)}</strong></label>
                                <select value={formData.role || user.role} onChange={(e) => setFormData({...formData, role: e.target.value})} className="form-select">
                                    {getRoleOptions(currentUser?.role).map(option => (
                                        <option key={option.value} value={option.value}>{option.label}</option>
                                    ))}
                                </select>
                            </div>
                            <p className="modal-note"> Solo puedes asignar roles inferiores al tuyo ({getRoleLabel(currentUser?.role)}).</p>
                            <div className="modal-actions">
                                <button type="button" onClick={() => setActiveModal(null)}>Cancelar</button>
                                <button type="submit" className="primary" disabled={loading}>{loading ? 'Aplicando...' : 'Aplicar Cambio'}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
            
            {activeModal === 'delete' && (
                <div className="action-modal-overlay" onClick={() => setActiveModal(null)}>
                    <div className="action-modal" onClick={(e) => e.stopPropagation()}>
                        <h3>Eliminar Usuario - {user.username}</h3>
                        <form onSubmit={handleDeleteSubmit}>
                            <div className="warning-message">
                                <p><strong>ADVERTENCIA: Esta acción no se puede deshacer.</strong></p>
                                <p>Se eliminarán todos los posts, comentarios y datos del usuario.</p>
                            </div>
                            <div className="form-group">
                                <label>Motivo de eliminación *</label>
                                <textarea value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Proporcione un motivo para la eliminación..." rows="3" required/>
                            </div>
                            <div className="modal-actions">
                                <button type="button" onClick={() => setActiveModal(null)}>Cancelar</button>
                                <button type="submit" className="primary danger" disabled={!reason.trim() || loading}>{loading ? 'Eliminando...' : 'Confirmar Eliminación'}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    )
}

export default UserActionsMenu