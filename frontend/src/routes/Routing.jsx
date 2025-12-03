import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import LoginPage from '../pages/LoginPage.jsx'
import Forum from '../pages/Forum.jsx'
import UserSettingsPage from '../pages/UserSettingsPage.jsx'
import PostPage from '../pages/PostPage.jsx'


const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading, user } = useAuth()
  
  if (loading) {
    return <div>Cargando...</div>
  }

  return isAuthenticated && user && !user.isGuest ? children : <Navigate to="/login" replace />
}
const PublicRoute = ({ children }) => {
  const { isAuthenticated, loading, user } = useAuth()
  
  if (loading) {
    return <div>Cargando...</div>
  }
  return (isAuthenticated && user && !user.isGuest) ? <Navigate to="/forum" replace /> : children
}
const GuestRoute = ({ children }) => {
  const { isAuthenticated, loading, user } = useAuth()
  
  if (loading) {
    return <div>Cargando...</div>
  }
  return isAuthenticated ? children : <Navigate to="/login" replace />
}

function Routing() {
  return (
    <Routes>
      <Route 
        path="/login" 
        element={
          <PublicRoute>
            <LoginPage />
          </PublicRoute>
        } 
      />
      <Route 
        path="/forum" 
        element={
          <GuestRoute>
            <Forum />
          </GuestRoute>
        } 
      />
      <Route 
        path="/settings" 
        element={
          <ProtectedRoute>
            <UserSettingsPage />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/posts/:id" 
        element={
          <GuestRoute>
            <PostPage />
          </GuestRoute>
        } 
      />
      <Route path="/" element={<Navigate to="/forum" replace />} />
      <Route path="*" element={<div>Página no encontrada - 404</div>} />
    </Routes>
  )
}

export default Routing