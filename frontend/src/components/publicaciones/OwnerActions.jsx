import React, { useState } from 'react'
import { useApi } from '../../hooks/useApi'
import { useToast } from '../../context/ToastContext'
import '../../styles/OwnerActions.css'

const OwnerActions = ({
    contentType,
    contentId,
    authorProfileId,
    currentUser,
    onUpdate,
    onDelete,
    onSuccess,
    initialTitle = "",
    initialContent = "",
    showDeleteConfirm = true,
    showEdit = true,
    className = "",
}) => {
    const [isEditing, setIsEditing] = useState(false)
    const [showDeleteModal, setShowDeleteModal] = useState(false)
    const [editedTitle, setEditedTitle] = useState(initialTitle)
    const [editedContent, setEditedContent] = useState(initialContent)
    const [isDeleting, setIsDeleting] = useState(false)
    
    const { execute } = useApi()
    const { showToast } = useToast()

    const isOwner = currentUser && 
                    currentUser.id && 
                    authorProfileId && 
                    currentUser.id === authorProfileId

    if (!isOwner) {
        return null
    }

    const handleEditSubmit = async () => {
        if (contentType === 'post' && !editedTitle.trim()) {
            showToast('El título es requerido', 'warning')
            return
        }
        
        if (!editedContent.trim()) {
            showToast('El contenido es requerido', 'warning')
            return
        }

        try {
            const updateData = contentType === 'post' 
                ? { title: editedTitle.trim(), content: editedContent.trim() }
                : { content: editedContent.trim() }

            await execute(() => onUpdate(contentId, updateData))
            
            setIsEditing(false)
            if (onSuccess) onSuccess()
            showToast(
                contentType === 'post' 
                    ? 'Publicación actualizada exitosamente' 
                    : 'Comentario actualizado exitosamente', 
                'success'
            )
        } catch (err) {
            console.error(`Error editando ${contentType}:`, err)
            showToast(`No se pudo actualizar el ${contentType}`, 'error')
        }
    }

    const handleDelete = async () => {
        try {
            setIsDeleting(true)
            await execute(() => onDelete(contentId))
            
            setShowDeleteModal(false)
            if (onSuccess) onSuccess()
            showToast(
                contentType === 'post' 
                    ? 'Publicación eliminada exitosamente' 
                    : 'Comentario eliminado exitosamente', 
                'success'
            )
        } catch (err) {
            console.error(`Error eliminando ${contentType}:`, err)
            showToast(`No se pudo eliminar el ${contentType}`, 'error')
            setIsDeleting(false)
        }
    }

    const handleCancelEdit = () => {
        setIsEditing(false)
        setEditedTitle(initialTitle)
        setEditedContent(initialContent)
    }

    const renderEditForm = () => (
        <div className={`owner-edit-form ${className}`}>
            {contentType === 'post' && (
                <input type="text" value={editedTitle} onChange={(e) => setEditedTitle(e.target.value)} className="owner-edit-title" placeholder="Título"/>
            )}
            <textarea value={editedContent} onChange={(e) => setEditedContent(e.target.value)} className="owner-edit-content" placeholder="Contenido" rows={contentType === 'post' ? 6 : 3}/>
            <div className="owner-edit-actions">
                <button onClick={handleCancelEdit} className="owner-btn-cancel">Cancelar</button>
                <button onClick={handleEditSubmit} className="owner-btn-save" disabled={(contentType === 'post' && !editedTitle.trim()) || !editedContent.trim()}>Guardar Cambios</button>
            </div>
        </div>
    )

    const renderActionButtons = () => (
        <div className={`owner-action-buttons ${className}`}>
            {showEdit && (
                <button onClick={() => setIsEditing(true)} className="owner-btn-edit" title={`Editar ${contentType}`}>
                    <img src="/edit.png" alt="Editar" className="owner-action-icon" />
                    {contentType === 'post' ? 'Editar Publicación' : 'Editar'}
                </button>
            )}
            {showDeleteConfirm && (
                <button onClick={() => setShowDeleteModal(true)} className="owner-btn-delete" title={`Eliminar ${contentType}`}>
                    <img src="/delete.png" alt="Eliminar" className="owner-action-icon" />
                    {contentType === 'post' ? 'Eliminar Publicación' : 'Eliminar'}
                </button>
            )}
        </div>
    )

    const renderDeleteModal = () => {
        if (!showDeleteModal) return null

        const contentTypes = {
            'post': 'publicación',
            'comment': 'comentario'
        }

        return (
            <div className="owner-modal-overlay">
                <div className="owner-delete-modal">
                    <h3>¿Eliminar {contentTypes[contentType]}?</h3>
                    <p>
                        {contentType === 'post' 
                            ? 'Esta acción no se puede deshacer. Se eliminará la publicación y todos sus comentarios.'
                            : 'Esta acción no se puede deshacer. El comentario será eliminado permanentemente.'
                        }
                    </p>
                    <div className="owner-modal-actions">
                        <button onClick={() => setShowDeleteModal(false)} className="owner-btn-cancel" disabled={isDeleting}>Cancelar</button>
                        <button onClick={handleDelete} className="owner-btn-confirm-delete" disabled={isDeleting}> {isDeleting ? 'Eliminando...' : `Sí, Eliminar`}</button>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <>
            {isEditing ? renderEditForm() : renderActionButtons()}
            {renderDeleteModal()}
        </>
    )
}

export default OwnerActions