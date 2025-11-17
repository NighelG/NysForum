import React, { useState } from "react"
import { useApi } from "../hooks/useApi"
import { postService } from "../services/postService"

function CreatePostDrawer({ isOpen, setIsOpen, onPostCreated }) {
const [title, setTitle] = useState("")
const [content, setContent] = useState("")
const [categoryIds, setCategoryIds] = useState([])
const [errorMsg, setErrorMsg] = useState("")
const { execute, loading } = useApi()

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
    const newPost = {
        title,
        content,
        category_ids: categoryIds,
    }
    
    try {
        await execute(() => postService.createPost(newPost))
        setTitle("")
        setContent("")
        setCategoryIds([])
        setErrorMsg("")
        setIsOpen(false)
        if (onPostCreated) {
                onPostCreated()
        }
    } catch (error) {
        setErrorMsg(error.message || "Error al publicar")
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
            <img className="tinyIcon" src="/img/closemenu.png" alt="X" />
            </button>
        </div>
        <div className="drawer-content">
            {errorMsg && <p className="error-message">{errorMsg}</p>}
            <input type="text" placeholder="Título" className="input" value={title} onChange={(e) => setTitle(e.target.value)}/>
            <textarea placeholder="Redacta la discusión" className="textarea" value={content} onChange={(e) => setContent(e.target.value)}/>
            <input type="text" placeholder='Agrega una url de un video o imagen (para agregar multiples utiliza comas)' 
            className='input' value={media} onChange={(e) => setMedia(e.target.value)}  /> 
            <button className="submit-btn"onClick={createPost}disabled={loading}>
            {loading ? "Publicando..." : "Publicar"}
            </button>
        </div>
        </div>
    </div>
    </div>
)
}

export default CreatePostDrawer
