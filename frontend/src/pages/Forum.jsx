import React from 'react'
import { useAuth } from '../context/AuthContext.jsx'

function Forum() {
  const { user, logout } = useAuth()
  
  return (
    <div>
      <h1>Bienvenido al Lobby</h1>
      {user && <p>Hola, {user.username}!</p>}
      <button onClick={logout}>Cerrar Sesión</button>
    </div>
  )
}

export default Forum