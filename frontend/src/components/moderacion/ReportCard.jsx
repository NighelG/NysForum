import React from 'react'
import { CATEGORIES, getStatusLabel } from '../../utils/moderationUtils'

function ReportCard({ 
    report, 
    type, 
    index, 
    isResolving, 
    resolveData,
    onActionChange,
    onNotesChange,
    onResolve
}) {

    const isPost = type === 'post'
    const reportKey = `${type}-${report.id}`
    const isActive = resolveData.activeKey === reportKey

    const categoryLabel = CATEGORIES.find(c => c.value === report.category)?.label || report.category
    
    return (
        <div className="report-card">
            <div className="report-header">
                <span className={`report-type ${isPost ? 'post' : 'comment'}`}>
                    {isPost ? 'Post' : 'Comentario'}
                </span>
                <span className={`report-category ${report.category}`}>
                    {categoryLabel}
                </span>
                <span className="report-status" data-status={report.status}>
                    {getStatusLabel(report.status)}
                </span>
                <span className="report-date">
                    {new Date(report.created_at).toLocaleDateString()}
                </span>
            </div>
            
            <div className="report-content">
                <div className="report-info">
                    <p><strong>Reportado por:</strong> {report.reporter?.username || 'Usuario'}</p>
                    <p><strong>Autor del contenido:</strong> {
                        isPost ? report.post_author : report.comment_author
                    }</p>
                    {isPost ? (
                        <p><strong>Post: </strong> "{report.post_title}"</p>
                    ) : (
                        <p><strong>Comentario en: </strong> "{report.post_info?.title || 'Post'}"</p>
                    )}
                </div>
                
                <div className="report-preview">
                    <p><strong>Vista previa:</strong></p>
                    <p className="preview-content">
                        {isPost ? report.post_content_preview : report.comment_content_preview}
                    </p>
                </div>
                
                <div className="report-reason">
                    <p><strong>Motivo del reporte:</strong> {report.reason}</p>
                </div>
                
                {report.admin_notes && (
                    <div className="admin-notes">
                        <p><strong>Notas del administrador:</strong> {report.admin_notes}</p>
                    </div>
                )}
            </div>
            
            {report.status === 'pending' && (
                <div className="report-actions">
                    <div className="resolve-form">
                        <select
                            value={isActive ? resolveData.action : ''}
                            onChange={(e) => onActionChange(reportKey, e.target.value)}
                            className="action-select"
                            disabled={isResolving}
                        >
                            <option value="">Seleccionar acción</option>
                            <option value="reviewed">Marcar como revisado</option>
                            <option value="dismissed">Desestimar reporte</option>
                            <option value="warn">Advertir usuario</option>
                            <option value="remove">Eliminar contenido</option>
                        </select>

                        <textarea
                            value={isActive ? resolveData.notes : ''}
                            onChange={(e) => onNotesChange(reportKey, e.target.value)}
                            placeholder="Notas adicionales..."
                            className="notes-textarea"
                            rows="2"
                            disabled={isResolving}
                        />
                        
                        <button
                            onClick={onResolve}
                            className="btn-resolve"
                            disabled={isResolving || !isActive || !resolveData.action}
                        >
                            {isResolving ? 'Procesando...' : 'Resolver'}
                        </button>
                    </div>
                </div>
            )}
        </div>
    )
}

export default React.memo(ReportCard)
