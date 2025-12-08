export const SECTIONS = [
  { id: 'pending', label: 'Reportes Pendientes' },
  { id: 'history', label: 'Historial de Acciones' },
  { id: 'stats', label: 'Estadísticas' }
]

export const CATEGORIES = [
  { value: 'spam', label: 'Spam' },
  { value: 'harassment', label: 'Acoso' },
  { value: 'inappropriate', label: 'Contenido inapropiado' },
  { value: 'misinformation', label: 'Información falsa' },
  { value: 'other', label: 'Otro' }
]

export const ACTIONS = [
  { value: 'reviewed', label: 'Marcar como revisado' },
  { value: 'dismissed', label: 'Desestimar reporte' },
  { value: 'warn', label: 'Advertir usuario' },
  { value: 'remove', label: 'Eliminar contenido' }
]

export const ACTION_LABELS = {
  'delete': 'Eliminar',
  'warn': 'Advertencia',
  'approve': 'Aprobar',
  'hide': 'Ocultar',
  'pin': 'Fijar',
  'unpin': 'Desfijar',
  'reviewed': 'Revisado',
  'resolved': 'Resuelto',
  'dismissed': 'Desestimado'
}

export const STATUS_LABELS = {
  'pending': 'Pendiente',
  'reviewed': 'Revisado',
  'resolved': 'Resuelto',
  'dismissed': 'Desestimado'
}

export const getActionLabel = (action) => ACTION_LABELS[action] || action
export const getStatusLabel = (status) => STATUS_LABELS[status] || status

export const getTimeAgo = (date) => {
  const now = new Date()
  const diffMs = now - date
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 60) {
    return `hace ${diffMins} min${diffMins !== 1 ? 's' : ''}`
  } else if (diffHours < 24) {
    return `hace ${diffHours} hora${diffHours !== 1 ? 's' : ''}`
  } else if (diffDays < 7) {
    return `hace ${diffDays} día${diffDays !== 1 ? 's' : ''}`
  }
  return date.toLocaleDateString()
}

export const generateUniqueKey = (item, type, index) => {
  if (item && item.id) return `${type}-${item.id}`
  return `${type}-${index}-${Date.now()}`
}

// Estado inicial y reducer
export const initialState = {
  activeSection: 'pending',
  filters: { status: 'pending', type: 'all', category: 'all' },
  reports: { posts: [], comments: [], total: 0 },
  stats: null,
  history: { posts: [], comments: [] },
  resolving: null,
  resolveData: { action: 'reviewed', notes: '' }
}

export function stateReducer(state, action) {
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
      return { ...state, resolveData: { ...state.resolveData, ...action.payload } }
    case 'RESET_RESOLVE_FORM':
      return { ...state, resolveData: initialState.resolveData, resolving: null }
    default:
      return state
  }
}