export const SECTIONS = [
  { id: 'pending', label: 'Reportes Pendientes' },
  { id: 'history', label: 'Historial' },
  { id: 'stats', label: 'Estadísticas' },
  { id: 'categories', label: 'Categorías' }
]

export const CATEGORIES = [
  { value: 'spam', label: 'Spam' },
  { value: 'inappropriate', label: 'Contenido inapropiado' },
  { value: 'harassment', label: 'Acoso' },
  { value: 'other', label: 'Otro' }
]

export const RESOLVE_ACTIONS = [
  { value: 'reviewed', label: 'Marcar como revisado' },
  { value: 'dismissed', label: 'Descartar reporte' },
  { value: 'content_removed', label: 'Contenido eliminado' },
  { value: 'user_warned', label: 'Usuario advertido' },
  { value: 'user_suspended', label: 'Usuario suspendido' },
  { value: 'user_banned', label: 'Usuario baneado' }
]

export const initialState = {
  activeSection: 'pending',
  filters: {
    type: 'all',
    category: 'all'
  },
  reports: {
    posts: [],
    comments: [],
    total: 0
  },
  stats: null,
  history: {
    posts: [],
    comments: []
  },
  resolving: null,
  resolveData: {
    activeKey: null,
    action: '',
    notes: ''
  }
}

export const stateReducer = (state, action) => {
  switch (action.type) {
    case 'SET_ACTIVE_SECTION':
      return { ...state, activeSection: action.payload }
    
    case 'SET_FILTERS':
      return { ...state, filters: { ...state.filters, ...action.payload } }
    
    case 'SET_REPORTS':
      return { ...state, reports: action.payload }
    
    case 'SET_STATS':
      return { ...state, stats: action.payload }
    
    case 'SET_HISTORY':
      return { ...state, history: action.payload }
    
    case 'SET_RESOLVING':
      return { ...state, resolving: action.payload }
    
    case 'SET_RESOLVE_DATA':
      return {
        ...state,
        resolveData: {
          ...state.resolveData,
          ...action.payload
        }
      }
    
    case 'RESET_RESOLVE_FORM':
      return { 
        ...state, 
        resolving: null,
        resolveData: {
          activeKey: null,
          action: '',
          notes: ''
        }
      }
    
    default:
      return state
  }
}

export const getStatusLabel = (status) => {
  const statusLabels = {
    'pending': 'Pendiente',
    'resolved': 'Resuelto',
    'reviewed': 'Revisado',
    'dismissed': 'Descartado'
  }
  return statusLabels[status] || status
}

export const generateUniqueKey = (item, type, index) => {
  return `${type}-${item.id || index}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}

export const getActionLabel = (action) => {
  const actionLabels = {
    'reviewed': 'Revisado',
    'dismissed': 'Descartado',
    'content_removed': 'Contenido eliminado',
    'user_warned': 'Usuario advertido',
    'user_suspended': 'Usuario suspendido',
    'user_banned': 'Usuario baneado',
    'post_deleted': 'Post eliminado',
    'comment_deleted': 'Comentario eliminado',
    'user_silenced': 'Usuario silenciado',
    'user_activated': 'Usuario activado',
    'role_changed': 'Rol cambiado',
    'user_deleted': 'Usuario eliminado'
  }
  return actionLabels[action] || action
}

export const getTimeAgo = (dateString) => {
  const date = new Date(dateString)
  const now = new Date()
  const diffInSeconds = Math.floor((now - date) / 1000)
  
  if (diffInSeconds < 60) {
    return 'hace unos segundos'
  }
  
  const diffInMinutes = Math.floor(diffInSeconds / 60)
  if (diffInMinutes < 60) {
    return `hace ${diffInMinutes} minuto${diffInMinutes !== 1 ? 's' : ''}`
  }
  
  const diffInHours = Math.floor(diffInMinutes / 60)
  if (diffInHours < 24) {
    return `hace ${diffInHours} hora${diffInHours !== 1 ? 's' : ''}`
  }
  
  const diffInDays = Math.floor(diffInHours / 24)
  if (diffInDays < 30) {
    return `hace ${diffInDays} día${diffInDays !== 1 ? 's' : ''}`
  }
  
  const diffInMonths = Math.floor(diffInDays / 30)
  if (diffInMonths < 12) {
    return `hace ${diffInMonths} mes${diffInMonths !== 1 ? 'es' : ''}`
  }
  
  const diffInYears = Math.floor(diffInMonths / 12)
  return `hace ${diffInYears} año${diffInYears !== 1 ? 's' : ''}`
}
