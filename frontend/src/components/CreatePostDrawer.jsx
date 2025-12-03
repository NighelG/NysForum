import React, { useState, useEffect } from 'react'
import { useApi } from '../hooks/useApi'
import { postService } from '../services/postService.js'
import mediaService from '../services/mediaSerivce.js'
import '../styles/CreatePostDrawer.css'

function CreatePostDrawer({ isOpen, setIsOpen, onPostCreated }) {
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [mediaFiles, setMediaFiles] = useState([])
  const [errorMsg, setErrorMsg] = useState('')
  const [categories, setCategories] = useState([])
  const [selectedCategoryId, setSelectedCategoryId] = useState("")
  const { execute, loading } = useApi()
  useEffect(() => {
    if (isOpen) {
      postService.getCategories()
        .then(data => setCategories(data))
        .catch(() => console.error("Error cargando categorías"))
    }
  }, [isOpen])
  
  const handleFileSelect = (event) => {
    const files = Array.from(event.target.files)
    const validFiles = files.filter(file => {
      const mediaType = mediaService.getMediaType(file)
      const sizeError = mediaService.getSizeErrorMessage(file)
      if (!mediaService.validateFileType(file, mediaType)) {
        setErrorMsg(`Tipo de archivo no soportado: ${file.name}`)
        return false
      }
      if (sizeError) {
        setErrorMsg(sizeError)
        return false
      }
      return true
    })
    setMediaFiles(prev => [...prev, ...validFiles])
    setErrorMsg('')
  }
  
  const removeFile = (index) => {
    setMediaFiles(prev => prev.filter((_, i) => i !== index))
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
    if (!selectedCategoryId) {
      setErrorMsg("Selecciona una categoría")
      return
    }
    
    try {
      const newPost = {
        title,
        content,
        categories: [parseInt(selectedCategoryId)],
        media_files: mediaFiles.map(file => ({
          file: file,
          media_type: mediaService.getMediaType(file)
        }))
      }
      
      await execute(() => postService.createPost(newPost))
      setTitle('')
      setContent('')
      setMediaFiles([])
      setSelectedCategoryId("")
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
      {isOpen && (
        <div className="create-post-overlay" onClick={() => setIsOpen(false)} />
      )}
      <div className={`create-post-drawer ${isOpen ? "open" : ""}`}>
        <div className="create-post-drawer-header">
          <h2 className="create-post-drawer-title">Nueva Discusión</h2>
          <button className="create-post-drawer-close" onClick={() => setIsOpen(false)} aria-label="Cerrar">X</button>
        </div>
        <div className="create-post-drawer-content">
          {errorMsg && (
            <p className="create-post-error">{errorMsg}</p>
          )}
          <input type="text" placeholder="Título de la discusión *" className="create-post-input"  value={title} onChange={(e) => setTitle(e.target.value)}/>
          <textarea placeholder="Describe tu tema o pregunta *" className="create-post-textarea" value={content} onChange={(e) => setContent(e.target.value)}/>
          <select className="create-post-select" value={selectedCategoryId}  onChange={(e) => setSelectedCategoryId(e.target.value)}>
            <option value="">Selecciona una categoría *</option>
            {categories.map(cat => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
          <div className="create-post-media-section">
            <label className="create-post-file-label">
              <input type="file" multiple accept="image/*,video/*,audio/*" onChange={handleFileSelect} className="create-post-file-input"/>Agregar archivos</label>
            {mediaFiles.length > 0 && (
              <div className="create-post-media-preview">
                {mediaFiles.map((file, index) => (
                  <div key={index} className="create-post-media-item">
                    <span className="create-post-media-name">
                      {file.name} ({mediaService.getMediaType(file)})
                    </span>
                    <button type="button" onClick={() => removeFile(index)} className="create-post-remove-file" aria-label="Eliminar archivo">X</button>
                  </div>
                ))}
              </div>
            )}
          </div>
          <button className="create-post-submit" onClick={createPost} disabled={loading}>{loading ? 'Publicando...' : 'Crear Discusión'}</button>
        </div>
      </div>
    </div>
  )
}

export default CreatePostDrawer