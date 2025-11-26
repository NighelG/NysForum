/* 
--Recomendable leer--

Este componente es de prueba unicamente, conservado debido a su utilidad durante el desarrollo de mi proyecto.
Este componente se utilizo para entender la naturaleza con respecto a un error con la renderizacion de los avatares / pfp / foto de perfil
de los usuarios, si el profesor que lo quiera probar solo tiene que descomentar el <AvatarTest /> que se encuentra al final de UserSettingsPage.jsx y dirigirse a http://localhost:5173/settings
su funcionalidad es de reconozer si la foto de perfil de un usuario fue correctamente optenida desde MongoDB y mostrar su estado, si no, envia un error a la consola que ayuda a pinpoint la ubicacion de error.
*/

import React, { useState, useEffect } from 'react'

function AvatarTest() {
    const [avatarUrl, setAvatarUrl] = useState('')
    const [status, setStatus] = useState('')
    const [userData, setUserData] = useState(null)

    useEffect(() => {
        testAvatar()
    }, [])

    const testAvatar = async () => {
        try {
            setStatus(' Probando avatar...')
            console.log(' Iniciando prueba de avatar...')
            const token = localStorage.getItem('authToken')
            console.log(' Token disponible:', !!token)
            
            if (!token) {
                throw new Error('No hay token de autenticación')
            }

            console.log('Obteniendo datos del usuario...')
            const userResponse = await fetch('http://localhost:8000/users/profiles/me/', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            })
            
            console.log('Respuesta usuario:', userResponse.status)
            
            if (!userResponse.ok) {
                const errorText = await userResponse.text()
                throw new Error(`Error obteniendo usuario: ${userResponse.status} - ${errorText}`)
            }
            
            const userData = await userResponse.json()
            console.log('Datos completos del usuario:', userData)
            setUserData(userData)
            if (!userData.username) {
                console.error('USERNAME ES UNDEFINED:', userData)
                throw new Error('Username no está definido en los datos del usuario')
            }
            console.log('Username encontrado:', userData.username)
            console.log('Avatar ID:', userData.avatar)
            const testAvatarUrl = `http://localhost:8000/users/profiles/${userData.username}/avatar/?t=${Date.now()}`
            console.log('URL construida:', testAvatarUrl)
            setAvatarUrl(testAvatarUrl)
            console.log('Probando con fetch...')
            const avatarResponse = await fetch(testAvatarUrl, {
                mode: 'cors',
                credentials: 'omit'
            })
            
            console.log('Respuesta avatar:', avatarResponse.status, avatarResponse.statusText)
            console.log('Headers avatar:', Object.fromEntries([...avatarResponse.headers]))
            
            if (!avatarResponse.ok) {
                const errorText = await avatarResponse.text()
                throw new Error(`Error en avatar: ${avatarResponse.status} - ${errorText}`)
            }
            
            const blob = await avatarResponse.blob()
            console.log('Blob creado:', blob.size, 'bytes, tipo:', blob.type)

            const objectUrl = URL.createObjectURL(blob)
            console.log('Object URL creada:', objectUrl)
            
            setAvatarUrl(objectUrl)
            setStatus('Avatar funciona correctamente')
            
        } catch (error) {
            console.error('Error en prueba:', error)
            setStatus(`Error: ${error.message}`)
        }
    }

    return (
        <div style={{ padding: '20px', border: '2px solid blue', margin: '20px',background: '#5d6c7aff'}}>
            <h2>Prueba de Avatar</h2>
            <p><strong>Estado:</strong> {status}</p>
            
            {userData && (
                <div style={{ marginBottom: '10px', padding: '10px', background: '#5d6c7aff' }}>
                    <h3>Datos del Usuario:</h3>
                    <p><strong>Username:</strong> {userData.username || 'UNDEFINED'}</p>
                    <p><strong>Avatar ID:</strong> {userData.avatar || 'No tiene avatar'}</p>
                    <p><strong>Email:</strong> {userData.email}</p>
                </div>
            )}
            
            {avatarUrl && (
                <div>
                    <p><strong>URL:</strong> {avatarUrl}</p>
                    <img src={avatarUrl} alt="Avatar de prueba" style={{ width: '150px', height: '150px', border: '3px solid green', display: 'block'}}
                        onError={(e) => {console.error(' Error en img tag:', e); e.target.style.border = '3px solid red'; setStatus(' Error cargando imagen en tag img')}}
                        onLoad={() => {
                            console.log(' Img tag cargó correctamente')
                            setStatus(' AVATAR FUNCIONA COMPLETAMENTE')
                        }}
                    />
                </div>
            )}
            <button onClick={testAvatar} style={{ marginTop: '10px', padding: '10px' }}>
                Volver a probar
            </button>
        </div>
    )
}

export default AvatarTest