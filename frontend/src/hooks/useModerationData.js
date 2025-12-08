import { useCallback } from 'react'
import { useToast } from '../context/ToastContext'
import moderationService from '../services/moderationService'

export function useModerationData(isAdmin, execute, navigate) {
    const { showToast } = useToast()
    
    const loadReports = useCallback(async (filters) => {
        if (!isAdmin) {
            showToast('No tienes permisos de administrador', 'warning')
            navigate('/forum')
            return null
        }
        
        try {
            return await execute(() => moderationService.getAllReports(filters))
        } catch (error) {
            console.error('Error cargando reportes:', error)
            showToast('Error cargando reportes', 'error')
            throw error
        }
    }, [execute, showToast, navigate, isAdmin])
    
    const loadStats = useCallback(async () => {
        if (!isAdmin) return null
        
        try {
            return await execute(() => moderationService.getStats())
        } catch (error) {
            console.error('Error cargando estadísticas:', error)
            showToast('Error cargando estadísticas', 'error')
            throw error
        }
    }, [execute, isAdmin, showToast])
    
    const loadHistory = useCallback(async () => {
        if (!isAdmin) return null
        
        try {
        const [postActions, commentActions] = await Promise.all([
            execute(() => moderationService.getPostActions()),
            execute(() => moderationService.getCommentActions())
        ])
        return { posts: postActions || [], comments: commentActions || [] }
        } catch (error) {
            console.error('Error cargando historial:', error)
            showToast('Error cargando historial', 'error')
            throw error
        }
    }, [execute, showToast, isAdmin])
    
    const resolveReport = useCallback(async (reportType, reportId, data) => {
        if (!isAdmin) {
            showToast('No tienes permisos para esta acción', 'warning')
            return null
        }
        
        try {
            return await execute(() => 
                moderationService.resolveReport(reportType, reportId, data)
            )
        } catch (error) {
            console.error('Error resolviendo reporte:', error)
            showToast('Error al resolver el reporte', 'error')
            throw error
        }
    }, [execute, isAdmin, showToast])
    
    return {
        loadReports,
        loadStats,
        loadHistory,
        resolveReport
    }
}