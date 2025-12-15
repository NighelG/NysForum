import { useState, useCallback, useEffect } from 'react'
import { userService } from '../services/userService'
import { filterUsers, sortUsers } from '../utils/userUtils'

export const useUserManagement = (currentUser) => {
  const [users, setUsers] = useState([])
  const [filteredUsers, setFilteredUsers] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  
  const [filters, setFilters] = useState({
    search: '',
    role: 'all',
    status: 'all'
  })
  
  const [sortBy, setSortBy] = useState('newest')
  
  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await userService.getUsers()
      if (Array.isArray(data)) {
        setUsers(data)
      } else {
        console.error('Datos no son array:', data)
        setError('Formato de datos inválido del servidor')
      }
      
      return data
    } catch (err) {
      console.error('useUserManagement: Error capturado:', err.message)

      if (err.message.includes('HTML') || err.message.includes('404') || err.message.includes('No autorizado')) {
        setError(`Error del servidor: ${err.message}`)
      } else if (err.message.includes('JSON')) {
        setError('El servidor devolvió una respuesta no válida')
      } else {
        setError('Error al cargar los usuarios. Verifica tu conexión.')
      }
      
      throw err
    } finally {
      setLoading(false)
    }
  }, [])
  
  const updateUser = useCallback(async (username, userData) => {
    try {
      setLoading(true)
      setError(null)
      const updatedUser = await userService.updateUser(username, userData)
      
      setUsers(prev => prev.map(user => 
        user.username === username ? { ...user, ...updatedUser } : user
      ))
      
      return updatedUser
    } catch (err) {
      setError(`Error al actualizar usuario: ${err.message}`)
      console.error('Error updating user:', err)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])
  
  const deleteUser = useCallback(async (username, reason = '') => {
    try {
      setLoading(true)
      setError(null)
      const result = await userService.deleteUser(username, reason)
      
      setUsers(prev => prev.filter(user => user.username !== username))
      
      return result
    } catch (err) {
      setError(`Error al eliminar usuario: ${err.message}`)
      console.error('Error deleting user:', err)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])
  
  const changeUserStatus = useCallback(async (username, status, reason = '') => {
    try {
      return await updateUser(username, { status })
    } catch (err) {
      throw err
    }
  }, [updateUser])
  
  const changeUserRole = useCallback(async (username, role) => {
    try {
      return await updateUser(username, { role })
    } catch (err) {
      throw err
    }
  }, [updateUser])
  
  const updateFilter = useCallback((key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }))
  }, [])
  
  const clearFilters = useCallback(() => {
    setFilters({
      search: '',
      role: 'all',
      status: 'all'
    })
  }, [])
  
  useEffect(() => {
    if (users.length === 0) {
      setFilteredUsers([])
      return
    }
    
    let result = filterUsers(users, filters)
    
    result = sortUsers(result, sortBy)
    
    setFilteredUsers(result)
  }, [users, filters, sortBy])
  
  return {
    users,
    filteredUsers,
    loading,
    error,
    filters,
    sortBy,
    setSortBy,
    fetchUsers,
    updateUser,
    deleteUser,
    changeUserStatus,
    changeUserRole,
    updateFilter,
    clearFilters,
    setError
  }
}