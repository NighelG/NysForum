import React, { useState, useEffect } from 'react'
import { useToast } from '../../context/ToastContext.jsx'
import { useApi } from '../../hooks/useApi.js'
import { postService } from '../../services/postService.js'
import mediaService from '../../services/mediaSerivce.js'
import '../../styles/CreatePostDrawer.css'

function CreatePostDrawer({ isOpen, setIsOpen, onPostCreated }) {
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [mediaFiles, setMediaFiles] = useState([])
  const [categories, setCategories] = useState([])
  const [selectedCategoryId, setSelectedCategoryId] = useState("")
  const { execute, loading } = useApi()
  const { showToast } = useToast()
  
  useEffect(() => {
    if (isOpen) {
      postService.getCategories()
        .then(data => setCategories(data))
        .catch(() => console.error("Error cargando categorías"))
    }
  }, [isOpen])
  
  const handleFileSelect = (event) => {
    const files = Array.from(event.target.files)
    let hasValidFiles = false
    
    files.forEach(file => {
      const mediaType = mediaService.getMediaType(file)
      const sizeError = mediaService.getSizeErrorMessage(file)
      
      if (!mediaService.validateFileType(file, mediaType)) {
        showToast(`Tipo de archivo no soportado: ${file.name}`, 'warning')
        return
      }
      
      if (sizeError) {
        showToast(sizeError, 'warning')
        return
      }
      
      setMediaFiles(prev => [...prev, file])
      hasValidFiles = true
    })
    
    if (hasValidFiles) {
      showToast('Archivo(s) agregado(s) correctamente', 'success')
    }
  }
  
  const removeFile = (index) => {
    setMediaFiles(prev => prev.filter((_, i) => i !== index))
    showToast('Archivo eliminado', 'info')
  }
  
  const createPost = async () => {
    if (!title || !content) {
      showToast("Llena todos los espacios", 'warning')
      return
    }
    if (title.length < 5) {
      showToast("El título debe tener al menos 5 caracteres", 'warning')
      return
    }
    if (content.length < 10) {
      showToast("El contenido debe tener al menos 10 caracteres", 'warning')
      return
    }
    if (!selectedCategoryId) {
      showToast("Selecciona una categoría", 'warning')
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
      setIsOpen(false)
      
      if (onPostCreated) {
        onPostCreated()
      }
      
      showToast('Discusión creada exitosamente', 'success')
      
    } catch (error) {
      console.error('Error al publicar:', error)
      showToast(error.message || 'Error al crear la discusión', 'error')
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
          <button className="create-post-drawer-close" onClick={() => setIsOpen(false)} aria-label="Cerrar"><img src="/close.png" alt="close" /></button>
        </div>
        <div className="create-post-drawer-content">
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