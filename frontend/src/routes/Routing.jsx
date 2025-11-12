import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import LoginPage from '../pages/LoginPage.jsx'
import Forum from '../pages/Forum.jsx'

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth()
  if (loading) {
    return <div>Cargando...</div>
  }
  return isAuthenticated ? children : <Navigate to="/login" replace />
}
const PublicRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth()
  
  if (loading) {
    return <div>Cargando...</div>
  }
  return !isAuthenticated ? children : <Navigate to="/forum" replace />
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
          <ProtectedRoute>
            <Forum />
          </ProtectedRoute>
        } 
      />
      <Route path="/" element={<Navigate to="/forum" replace />} />
      <Route path="*" element={<div>Página no encontrada - 404</div>} />
    </Routes>
  )
}

export default Routing