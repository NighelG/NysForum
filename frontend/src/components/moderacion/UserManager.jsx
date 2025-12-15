import React, { useState, useEffect, useCallback } from 'react'
import { useAuth } from '../../context/AuthContext'
import { useUserManagement } from '../../hooks/useUserManagement'
import { 
  getStatusLabel, 
  getRoleLabel, 
  getStatusColor, 
  getRoleColor
} from '../../utils/userUtils'
import UserActionsMenu from './UserActionsMenu'
import '../../styles/UserManager.css'

const UserManager = ({ isAdmin }) => {
  const { user: currentUser } = useAuth()
  const {
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
  } = useUserManagement(currentUser)

  const [successMessage, setSuccessMessage] = useState('')

  useEffect(() => {
    if (isAdmin) {
      fetchUsers()
    }
  }, [isAdmin, fetchUsers])

  const showSuccess = useCallback((message) => {
    setSuccessMessage(message)
    setTimeout(() => setSuccessMessage(''), 3000)
  }, [])

  const handleEdit = useCallback(async (username, userData) => {
    try {
      await updateUser(username, userData)
      showSuccess('Usuario actualizado exitosamente')
    } catch (err) {
      console.error('Error updating user:', err)
      setError('Error al actualizar usuario: ' + err.message)
    }
  }, [updateUser, showSuccess, setError])

  const handleStatusChange = useCallback(async (username, status, reason = '') => {
    try {
      await changeUserStatus(username, status, reason)
      showSuccess(`Estado cambiado a ${getStatusLabel(status)}`)
    } catch (err) {
      console.error('Error changing status:', err)
      setError('Error al cambiar estado: ' + err.message)
    }
  }, [changeUserStatus, showSuccess, setError])

  const handleRoleChange = useCallback(async (username, role) => {
    try {
      await changeUserRole(username, role)
      showSuccess(`Rol cambiado a ${getRoleLabel(role)}`)
    } catch (err) {
      console.error('Error changing role:', err)
      setError('Error al cambiar rol: ' + err.message)
    }
  }, [changeUserRole, showSuccess, setError])

  const handleDelete = useCallback(async (username, reason = '') => {
    try {
      await deleteUser(username, reason)
      showSuccess('Usuario eliminado exitosamente')
    } catch (err) {
      console.error('Error deleting user:', err)
      setError('Error al eliminar usuario: ' + err.message)
    }
  }, [deleteUser, showSuccess, setError])

  const getAvatarUrl = (user) => {
    if (user.avatar) {
      return `/api/users/profiles/${user.username}/avatar/`
    }
    return 'https://ui-avatars.com/api/?name=' + encodeURIComponent(user.username) + '&background=667eea&color=fff'
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  if (!isAdmin) {
    return (
      <div className="access-denied">
        <h2>Acceso Restringido</h2>
        <p>Esta sección solo está disponible para administradores.</p>
      </div>
    )
  }

  return (
    <div className="user-manager">
      <div className="manager-header">
        <h2>Gestión de Usuarios</h2>
        <div className="header-stats">
          {filteredUsers.length} de {users.length} usuarios
        </div>
      </div>

      <div className="filter-controls">
        <div className="search-box">
          <div className="search-icon"></div>
          <input type="text" placeholder="Buscar por nombre, email o bio..." value={filters.search} onChange={(e) => updateFilter('search', e.target.value)}/>
        </div>

        <div className="filter-group">
          <label>Rol:</label>
          <select className="filter-select" value={filters.role} onChange={(e) => updateFilter('role', e.target.value)}>
            <option value="all">Todos los roles</option>
            <option value="user">Usuario</option>
            <option value="moderator">Moderador</option>
            <option value="admin">Administrador</option>
            <option value="true_admin">Super Admin</option>
          </select>
        </div>

        <div className="filter-group">
          <label>Estado:</label>
          <select className="filter-select" value={filters.status} onChange={(e) => updateFilter('status', e.target.value)}>
            <option value="all">Todos los estados</option>
            <option value="normal">Normal</option>
            <option value="suspendido">Suspendido</option>
            <option value="baneado">Baneado</option>
          </select>
        </div>

        <div className="filter-group">
          <label>Ordenar:</label>
          <select className="filter-select" value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
            <option value="newest">Más recientes</option>
            <option value="oldest">Más antiguos</option>
            <option value="username">Nombre (A-Z)</option>
            <option value="posts">Más posts</option>
            <option value="role">Rol</option>
          </select>
        </div>

        <button className="btn-clear-filters" onClick={clearFilters} disabled={!filters.search && filters.role === 'all' && filters.status === 'all'}>Limpiar filtros</button>
      </div>

      {error && <div className="error-message">{error}</div>}
      {successMessage && <div className="success-message">{successMessage}</div>}

      {loading && users.length === 0 ? (
        <p className="loading-text">Cargando usuarios...</p>
      ) : filteredUsers.length === 0 ? (
        <div className="no-users">
          <p>No se encontraron usuarios</p>
          <p className="subtext">
            {filters.search || filters.role !== 'all' || filters.status !== 'all'
              ? 'Intenta con otros filtros o limpia la búsqueda.'
              : 'No hay usuarios registrados en el sistema.'}
          </p>
        </div>
      ) : (
        <>
          <div className="users-table-container">
            <table className="users-table">
              <thead>
                <tr>
                  <th>Usuario</th>
                  <th>Rol</th>
                  <th>Estado</th>
                  <th>Estadísticas</th>
                  <th>Registro</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map(user => (
                  <tr key={`user-${user.id}`}>
                    <td>
                      <div className="user-info">
                        <img src={getAvatarUrl(user)} alt={user.username}className="user-avatar"
                          onError={(e) => {
                            e.target.src = 'https://ui-avatars.com/api/?name=' + encodeURIComponent(user.username) + '&background=667eea&color=fff'
                          }}
                        />
                        <div className="user-text-info">
                          <span className="username">{user.username}</span>
                          <span className="user-email">{user.email}</span>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className={`role-badge ${user.role}`}>
                        {getRoleLabel(user.role)}
                      </span>
                    </td>
                    <td>
                      <span className={`status-badge ${user.status}`}>
                        {getStatusLabel(user.status)}
                      </span>
                    </td>
                    <td>
                      <div className="user-stats">
                        <div className="stat-item">
                          <span className="stat-icon"></span>
                          <span>{user.posts_count} posts</span>
                        </div>
                        <div className="stat-item">
                          <span className="stat-icon"></span>
                          <span>{user.comments_count} comentarios</span>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="user-date">
                        {formatDate(user.date_joined)}
                      </div>
                    </td>
                    <td>
                      <div className="user-actions">
                        <UserActionsMenu
                          user={user}
                          currentUser={currentUser}
                          onEdit={handleEdit}
                          onChangeStatus={handleStatusChange}
                          onChangeRole={handleRoleChange}
                          onDelete={handleDelete}
                          position="bottom-left"
                        />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="users-cards">
            {filteredUsers.map(user => (
              <div key={`user-card-${user.id}`} className="user-card">
                <div className="user-card-header">
                  <div className="user-info">
                    <img  src={getAvatarUrl(user)} alt={user.username} className="user-avatar"
                      onError={(e) => {
                        e.target.src = 'https://ui-avatars.com/api/?name=' + encodeURIComponent(user.username) + '&background=667eea&color=fff'
                      }}
                    />
                    <div className="user-text-info">
                      <span className="username">{user.username}</span>
                      <span className="user-email">{user.email}</span>
                    </div>
                  </div>
                  <div>
                    <span className={`role-badge ${user.role}`}>
                      {getRoleLabel(user.role)}
                    </span>
                  </div>
                </div>
                
                <div className="user-card-main">
                  <span className={`status-badge ${user.status}`}>
                    {getStatusLabel(user.status)}
                  </span>
                </div>
                
                <div className="user-card-stats">
                  <div className="stat-item">
                    <span>{user.posts_count} posts</span>
                  </div>
                  <div className="stat-item">
                    <span>{user.comments_count} comentarios</span>
                  </div>
                  <div className="stat-item">
                    <span>{formatDate(user.date_joined)}</span>
                  </div>
                </div>
                
                <div className="user-card-actions">
                  <UserActionsMenu
                    user={user}
                    currentUser={currentUser}
                    onEdit={handleEdit}
                    onChangeStatus={handleStatusChange}
                    onChangeRole={handleRoleChange}
                    onDelete={handleDelete}
                    position="bottom-right"
                  />
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

export default UserManager