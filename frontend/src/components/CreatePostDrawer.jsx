import React, { useState } from 'react'
import { useApi } from '../hooks/useApi'
import { postService } from '../services/postService'
import { cloudinaryService } from '../services/cloudinaryService'

function CreatePostDrawer({ isOpen, setIsOpen, onPostCreated }) {
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [mediaFiles, setMediaFiles] = useState([])
  const [errorMsg, setErrorMsg] = useState('')
  const { execute, loading } = useApi()

  const handleFileSelect = (event) => {
    const files = Array.from(event.target.files)
    setMediaFiles(prev => [...prev, ...files])
  }

  const removeFile = (index) => {
    setMediaFiles(prev => prev.filter((_, i) => i !== index))
  }

  const uploadMediaFiles = async () => {
    const uploadedMedia = []
    
    for (const file of mediaFiles) {
      try {
        const mediaData = await cloudinaryService.uploadMedia(file)
        uploadedMedia.push(mediaData)
      } catch (error) {
        console.error('Error subiendo medio:', error)
        throw new Error(`Error subiendo ${file.name}`)
      }
    }
    
    return uploadedMedia
  }

  const createPost = async () => {
    if (!title || !content) {
      setErrorMsg("Llena todos los espacios")
      return
    }

    if (title.length < 5) {
      setErrorMsg("El título debe tener al menos 5 caracteres")
      return
    }
    if (content.length < 10) {
      setErrorMsg("El contenido debe tener al menos 10 caracteres")
      return
    }

    try {
      let mediaData = []
      if (mediaFiles.length > 0) {
        mediaData = await uploadMediaFiles()
      }

      const newPost = {
        title,
        content,
        category_ids: [],
        media_files: mediaData
      }

      await execute(() => postService.createPost(newPost))

      setTitle('')
      setContent('')
      setMediaFiles([])
      setErrorMsg('')
      setIsOpen(false)
      
      if (onPostCreated) {
        onPostCreated()
      }
    } catch (error) {
      setErrorMsg(error.message || 'Error al publicar')
    }
  }

  return (
    <div>
      {isOpen && <div className="overlay" onClick={() => setIsOpen(false)} />}
      <div className={`drawer-container ${isOpen ? "open" : ""}`}>
        <div className="drawer-content-wrapper">
          <div className="drawer-header">
            <h2>Empezar discusión</h2>
            <button className="close-btn" onClick={() => setIsOpen(false)}>
              <img className='tinyIcon' src="/img/closemenu.png" alt="X" />
            </button>
          </div>
          <div className="drawer-content">
            {errorMsg && <p className="error-message">{errorMsg}</p>}
            <input type="text" placeholder="Título" className="input" value={title} onChange={(e) => setTitle(e.target.value)} />
            <textarea placeholder="Redacta la discusión" className="textarea" value={content} onChange={(e) => setContent(e.target.value)} />
            <div className="media-section">
              <label className="file-input-label">
                <input type="file" multiple accept="image/*,video/*,audio/*"onChange={handleFileSelect}className="file-input"/>
                Agregar medios
              </label>
              {mediaFiles.length > 0 && (
                <div className="media-preview">
                  {mediaFiles.map((file, index) => (
                    <div key={index} className="media-item">
                      <span>{file.name}</span>
                      <button type="button" onClick={() => removeFile(index)}className="remove-file-btn"> ✕ </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <button className="submit-btn" onClick={createPost} disabled={loading}>
              {loading ? 'Publicando...' : 'Publicar'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CreatePostDrawer