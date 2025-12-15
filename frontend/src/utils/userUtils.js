export const USER_STATUSES = {
  normal: 'Normal',
  suspendido: 'Suspendido',
  baneado: 'Baneado'
}

export const USER_ROLES = {
  user: 'Usuario',
  moderator: 'Moderador',
  admin: 'Administrador',
  true_admin: 'Super Administrador'
}

export const STATUS_COLORS = {
  normal: '#4caf50',
  silenciado: '#ff9800',
  suspendido: '#f44336',
  baneado: '#9c27b0'
}

export const ROLE_COLORS = {
  user: '#2196f3',
  moderator: '#673ab7',
  admin: '#ff5722',
  true_admin: '#ff00a6ff'
}

export const getStatusLabel = (status) => {
  return USER_STATUSES[status] || status
}

export const getRoleLabel = (role) => {
  return USER_ROLES[role] || role
}

export const getStatusColor = (status) => {
  return STATUS_COLORS[status] || '#666'
}

export const getRoleColor = (role) => {
  return ROLE_COLORS[role] || '#666'
}

export const canEditUser = (currentUser, targetUser) => {
  if (!currentUser || !targetUser) return false
  
  if (currentUser.username === targetUser.username) return false
  
  const roleHierarchy = {
    'true_admin': 4,
    'admin': 3,
    'moderator': 2,
    'user': 1
  }
  
  const currentRoleLevel = roleHierarchy[currentUser.role] || 0
  const targetRoleLevel = roleHierarchy[targetUser.role] || 0
  
  return currentRoleLevel > targetRoleLevel
}

export const canDeleteUser = (currentUser, targetUser) => {
  if (!currentUser || !targetUser) return false
  
  if (currentUser.username === targetUser.username) return false
  
  const roleHierarchy = {
    'true_admin': 4,
    'admin': 3,
    'moderator': 2,
    'user': 1
  }
  
  const currentRoleLevel = roleHierarchy[currentUser.role] || 0
  const targetRoleLevel = roleHierarchy[targetUser.role] || 0
  
  return currentRoleLevel > targetRoleLevel
}

export const filterUsers = (users, filters) => {
  if (!users || !Array.isArray(users)) return []
  
  const { search, role, status } = filters
  const searchTerm = search ? search.toLowerCase().trim() : ''
  
  return users.filter(user => {
    if (searchTerm) {
      const matchesSearch = 
        user.username.toLowerCase().includes(searchTerm) ||
        user.email.toLowerCase().includes(searchTerm) ||
        (user.first_name && user.first_name.toLowerCase().includes(searchTerm)) ||
        (user.last_name && user.last_name.toLowerCase().includes(searchTerm)) ||
        (user.bio && user.bio.toLowerCase().includes(searchTerm))
      
      if (!matchesSearch) return false
    }
    
    if (role && role !== 'all' && user.role !== role) return false
    
    if (status && status !== 'all' && user.status !== status) return false
    
    return true
  })
}

export const sortUsers = (users, sortBy) => {
  const sorted = [...users]
  
  switch (sortBy) {
    case 'username':
      return sorted.sort((a, b) => a.username.localeCompare(b.username))
    
    case 'newest':
      return sorted.sort((a, b) => new Date(b.date_joined) - new Date(a.date_joined))
    
    case 'oldest':
      return sorted.sort((a, b) => new Date(a.date_joined) - new Date(b.date_joined))
    
    case 'posts':
      return sorted.sort((a, b) => b.posts_count - a.posts_count)
    
    case 'role':
      const roleOrder = { 'true_admin': 4, 'admin': 3, 'moderator': 2, 'user': 1 }
      return sorted.sort((a, b) => roleOrder[b.role] - roleOrder[a.role])
    
    default:
      return sorted
  }
}

export const getRoleOptions = (currentUserRole) => {
  const allRoles = [
    { value: 'user', label: 'Usuario' },
    { value: 'moderator', label: 'Moderador' },
    { value: 'admin', label: 'Administrador' },
    { value: 'true_admin', label: 'Super Admin' }
  ]
  
  const roleHierarchy = {
    'true_admin': 4,
    'admin': 3,
    'moderator': 2,
    'user': 1
  }
  
  const currentLevel = roleHierarchy[currentUserRole] || 0
  
  return allRoles.filter(role => roleHierarchy[role.value] < currentLevel)
}

export const getStatusOptions = () => {
  return [
    { value: 'normal', label: 'Normal' },
    { value: 'suspendido', label: 'Suspendido' },
    { value: 'baneado', label: 'Baneado' }
  ]
}