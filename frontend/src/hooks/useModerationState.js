import { useCallback } from 'react'

export function useModerationState(dispatch, isAdmin) {
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