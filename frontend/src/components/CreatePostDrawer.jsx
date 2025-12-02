import React, { useState, useEffect } from 'react'
import { useApi } from '../hooks/useApi'
import { postService } from '../services/postService.js'
import mediaService from '../services/mediaSerivce.js'

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
      {isOpen && <div className="overlay" onClick={() => setIsOpen(false)} />}
      <div className={`drawer-container ${isOpen ? "open" : ""}`}>
        <div className="drawer-content-wrapper">
          <div className="drawer-header">
            <h2>Empezar discusión</h2>
            <button className="close-btn" onClick={() => setIsOpen(false)}>
              <img className='tinyIcon' src="/img/closemenu.png" alt="Cerrar" />
            </button>
          </div>
          <div className="drawer-content">
            {errorMsg && <p className="error-message">{errorMsg}</p>}
            <input type="text" placeholder="Título" className="input" value={title} onChange={(e) => setTitle(e.target.value)}/>
            <textarea placeholder="Redacta la discusión" className="textarea"value={content} onChange={(e) => setContent(e.target.value)} />
            <select className="input" value={selectedCategoryId} onChange={(e) => setSelectedCategoryId(e.target.value)}>
              <option value="">Selecciona categoría</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
            <div className="media-section">
              <label className="file-input-label">
                <input type="file" multiple accept="image/*,video/*,audio/*" onChange={handleFileSelect} className="file-input"/>
                Agregar medios
              </label>
              {mediaFiles.length > 0 && (
                <div className="media-preview">
                  {mediaFiles.map((file, index) => (
                    <div key={index} className="media-item">
                      <span>{file.name} ({mediaService.getMediaType(file)})</span>
                      <button type="button" onClick={() => removeFile(index)}className="remove-file-btn">✕</button>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <button className="submit-btn" onClick={createPost} disabled={loading}>{loading ? 'Publicando...' : 'Publicar'}</button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CreatePostDrawer