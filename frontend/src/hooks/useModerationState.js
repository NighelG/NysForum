import { useCallback } from 'react'

export function useModerationState(dispatch, isAdmin) {

    const handleResolveActionChange = useCallback((key, value) => {
        dispatch({
            type: 'SET_RESOLVE_DATA',
            payload: {
                activeKey: key,
                action: value
            }
        })
    }, [dispatch])
    
    const handleResolveNotesChange = useCallback((key, value) => {
        dispatch({
            type: 'SET_RESOLVE_DATA',
            payload: {
                activeKey: key,
                notes: value
            }
        })
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
