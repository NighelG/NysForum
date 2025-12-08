import { useCallback, useMemo } from 'react'
import { useToast } from '../context/ToastContext'
import moderationService from '../services/moderationService'

export const useModeration = (isAdmin, execute, navigate) => {
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

    export const useModerationActions = (state, dispatch, isAdmin, showToast) => {
    const handleResolveActionChange = useCallback((e) => {
        dispatch({ type: 'SET_RESOLVE_DATA', payload: { action: e.target.value } })
    }, [dispatch])
    
    const handleResolveNotesChange = useCallback((e) => {
        dispatch({ type: 'SET_RESOLVE_DATA', payload: { notes: e.target.value } })
    }, [dispatch])
    
    const handleFilterChange = useCallback((filterType, value) => {
        if (!isAdmin) return
        dispatch({ type: 'SET_FILTERS', payload: { [filterType]: value } })
    }, [dispatch, isAdmin])
    
    const handleSectionChange = useCallback((sectionId) => {
        dispatch({ type: 'SET_ACTIVE_SECTION', payload: sectionId })
    }, [dispatch])
    
    return {
        handleResolveActionChange,
        handleResolveNotesChange,
        handleFilterChange,
        handleSectionChange
    }
}