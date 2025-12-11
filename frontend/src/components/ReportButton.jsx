import React, { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { apiRequest } from '../services/apiConfig'
import '../styles/ReportButton.css'

const ReportButton = ({ contentType, contentId, contentAuthorId, onReportSubmitted }) => {
    const { user } = useAuth()
    const { showToast } = useToast()
    const [showModal, setShowModal] = useState(false)
    const [category, setCategory] = useState('spam')
    const [description, setDescription] = useState('')
    const [isSubmitting, setIsSubmitting] = useState(false)

    const categories = [
        { value: 'spam', label: 'Spam', description: 'Contenido repetitivo o publicitario no deseado' },
        { value: 'harassment', label: 'Acoso', description: 'Bullying, discurso de odio o acoso' },
        { value: 'inappropriate', label: 'Contenido inapropiado', description: 'Contenido sexual, violento o inapropiado' },
        { value: 'misinformation', label: 'Información falsa', description: 'Noticias falsas o información engañosa' },
        { value: 'other', label: 'Otro', description: 'Otra razón no listada' }
    ]

    const isGuest = user?.isGuest
    const isOwnContent = user?.id === contentAuthorId && !isGuest

    const handleOpenModal = () => {
        if (!user || isGuest) {
            showToast('Debes iniciar sesión (no como invitado) para reportar contenido', 'warning')
            return
        }
        if (isOwnContent) {
            showToast('No puedes reportar tu propio contenido', 'warning')
            return
        }
        setShowModal(true)
    }
    const handleSubmit = async () => {
        if (!description.trim() && category === 'other') {
            showToast('Por favor, describe la razón del reporte', 'warning')
            return
        }
        setIsSubmitting(true)
        try {
            const endpoint = contentType === 'post' 
            ? '/api/moderation/reports/posts/' 
            : '/api/moderation/reports/comments/'
            const payload = {
                [contentType]: contentId,
                category: category,
                reason: description.trim() || `Reporte por ${categories.find(c => c.value === category)?.label || category}`
                }
            await apiRequest(endpoint, {
                method: 'POST',
                body: JSON.stringify(payload)
            })
            setShowModal(false)
            setCategory('spam')
            setDescription('')
            if (onReportSubmitted) {
                onReportSubmitted(contentType, contentId)
            }
            showToast('Reporte enviado correctamente. Los moderadores lo revisarán pronto.', 'success')
        } catch (error) {
            console.error('Error al reportar:', error)
            showToast('Error al enviar el reporte. Intenta nuevamente.', 'error')
        } finally {
            setIsSubmitting(false)
        }
    }

    if (!user || isGuest || isOwnContent) {
        return null
    }

    return (
        <div>
            <button onClick={handleOpenModal} className="report-button" title="Reportar este contenido" disabled={isSubmitting}>
                <span className="report-text">Reportar</span>
            </button>
            {showModal && (
            <div className="report-modal-overlay" onClick={() => !isSubmitting && setShowModal(false)}>
                <div className="report-modal" onClick={(e) => e.stopPropagation()}>
                    <div className="report-modal-header">
                        <h3>Reportar {contentType === 'post' ? 'Publicación' : 'Comentario'}</h3>
                        <button onClick={() => setShowModal(false)} className="close-button" disabled={isSubmitting} aria-label="Cerrar"><img src="/close.png" alt="close" /></button>
                    </div>
                    <div className="report-modal-body">
                        <div className="form-group">
                            <label htmlFor="report-category">Motivo del reporte:</label>
                            <select id="report-category" value={category} onChange={(e) => setCategory(e.target.value)} className="category-select" disabled={isSubmitting}>
                                {categories.map(cat => (
                                <option key={cat.value} value={cat.value}>
                                    {cat.label}
                                </option>
                                ))}
                            </select>
                            <small className="category-description">
                                {categories.find(c => c.value === category)?.description}
                            </small>
                        </div>
                        <div className="form-group">
                            <label htmlFor="report-description"> Descripción adicional {category === 'other' ? '(requerida)' : '(opcional)'}:</label>
                            <textarea id="report-description" value={description} onChange={(e) => setDescription(e.target.value)} 
                                placeholder={`Describe el problema... ${category === 'other' ? 'Este campo es obligatorio.' : ''}`}
                                className="description-textarea" rows={4} disabled={isSubmitting} required={category === 'other'}/>
                        </div>
                        <div className="form-group">
                            <small className="disclaimer">
                                Los reportes falsos pueden resultar en la suspensión de tu cuenta.
                                Solo reporta contenido que viole las normas de la comunidad.
                            </small>
                        </div>
                    </div>
                    <div className="report-modal-footer">
                        <button onClick={() => setShowModal(false)} className="btn-secondary" disabled={isSubmitting}>Cancelar</button>
                        <button onClick={handleSubmit} className="btn-primary" disabled={isSubmitting || (category === 'other' && !description.trim())}>{isSubmitting ? 'Enviando...' : 'Enviar Reporte'}</button>
                    </div>
                </div>
            </div>
            )}
        </div>
    )
}

export default ReportButton