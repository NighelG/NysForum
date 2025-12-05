import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useApi } from '../hooks/useApi'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { postService } from '../services/postService'
import { commentService } from '../services/commentService'
import mediaService from '../services/mediaSerivce.js'
import Sidebar from '../components/SideBar.jsx'
import CommentSection from '../components/CommentSection.jsx'
import ReportButton from '../components/ReportButton.jsx'
import '../styles/PostPage.css'

const PostPage = () => {
    const { id } = useParams()
    const navigate = useNavigate()
    const { user } = useAuth()
    const { showToast } = useToast()
    const { execute, loading, error } = useApi()
    const [post, setPost] = useState(null)
    const [comments, setComments] = useState([])
    const [searchTerm, setSearchTerm] = useState('')
    const [isFormOpen, setIsFormOpen] = useState(false)
    const [commentContent, setCommentContent] = useState('')
    const [commentMediaFiles, setCommentMediaFiles] = useState([])
    const [commentErrorMsg, setCommentErrorMsg] = useState('')
    const [replyMediaFiles, setReplyMediaFiles] = useState({})
    const [replyContents, setReplyContents] = useState({})
    const [replyErrorMsg, setReplyErrorMsg] = useState('')
    const [replyingTo, setReplyingTo] = useState(null)
    const [expandedReplies, setExpandedReplies] = useState({})

    const loadPost = useCallback(async () => {
        try {
            const postData = await execute(() => postService.getPost(id))
            setPost(postData)
        } catch (err) {
            console.error('Error cargando post:', err)
            showToast('No se pudo cargar la publicación', 'error')
        }
    }, [id, execute, showToast])

    const loadComments = useCallback(async () => {
        try {
            const all = await execute(commentService.getComments)
            if (!Array.isArray(all)) return setComments([])
            const adapted = all
                .filter(c => c.post === parseInt(id))
                .map(c => ({
                    id: c.id,
                    content: c.content || '',
                    created_at: c.created_at,
                    profile: {
                        id: c.profile?.id ?? null,
                        avatar: c.profile?.username !== 'Usuario'
                            ? `http://localhost:8000/users/profiles/${c.profile?.username}/avatar/`
                            : '/defaultPFP.jpg',
                        username: c.profile?.username || 'Usuario',
                        role: c.profile?.role || 'user'
                    },
                    media_files: c.media_files || [],
                    likes_count: c.likes_count || 0,
                    dislikes_count: c.dislikes_count || 0,
                    user_reaction: c.user_reaction || null,
                    replies: (c.replies || []).sort((a, b) => new Date(a.created_at) - new Date(b.created_at))
                }))
            setComments(adapted)
        } catch (err) {
            console.error('Error cargando comentarios:', err)
            showToast('No se pudieron cargar los comentarios', 'error')
            setComments([])
        }
    }, [id, execute, showToast])

    useEffect(() => {
        if (!id) return
        loadPost()
        loadComments()
    }, [id, loadPost, loadComments])

    const handleReaction = async (action, serviceFn, idRefresh) => {
        if (!user || user.isGuest) return
        try {
            await execute(() => serviceFn(idRefresh, action))
            action.includes('post') ? loadPost() : loadComments()
        } catch (err) {
            console.error(`Error al reaccionar:`, err)
            showToast('No se pudo registrar tu reacción', 'error')
        }
    }

    const handleLikePost = () => handleReaction('like', postService.reactToPost, post.id)
    const handleDislikePost = () => handleReaction('dislike', postService.reactToPost, post.id)
    const handleLike = id => handleReaction('like', commentService.reactToComment, id)
    const handleDislike = id => handleReaction('dislike', commentService.reactToComment, id)

    const validateFile = file => {
        const mediaType = mediaService.getMediaType(file)
        const sizeError = mediaService.getSizeErrorMessage(file)

        if (!mediaService.validateFileType(file, mediaType))
            return { valid: false, error: `Tipo de archivo no soportado: ${file.name}` }

        if (sizeError)
            return { valid: false, error: sizeError }

        return { valid: true, mediaType }
    }
    const processFiles = (files, setError, callback) => {
        const validFiles = []
        let hasError = false
        
        for (const file of files) {
            const result = validateFile(file)
            if (!result.valid) {
                setError(result.error)
                showToast(result.error, 'warning')
                hasError = true
                continue
            }
            validFiles.push(file)
        }
        
        if (validFiles.length > 0) {
            callback(validFiles)
            if (validFiles.length === 1) {
                showToast('Archivo agregado correctamente', 'success')
            } else {
                showToast(`${validFiles.length} archivos agregados correctamente`, 'success')
            }
        } else if (!hasError && files.length > 0) {
            showToast('No se pudieron agregar los archivos', 'warning')
        }
    }
    const handleCommentFileSelect = e =>
        processFiles(
            Array.from(e.target.files),
            setCommentErrorMsg,
            valid => setCommentMediaFiles(prev => [...prev, ...valid])
        )
    const removeCommentFile = index =>
        setCommentMediaFiles(prev => prev.filter((_, i) => i !== index))
    const getReplyKey = (c, p) => (p ? `${p}-${c}` : c)
    const handleReplyFileSelect = (e, commentId, parentId = null) => {
        const key = getReplyKey(commentId, parentId)
        processFiles(
            Array.from(e.target.files),
            setReplyErrorMsg,
            valid =>
                setReplyMediaFiles(prev => ({
                    ...prev,
                    [key]: [...(prev[key] || []), ...valid]
                }))
        )
    }
    const removeReplyFile = (index, commentId, parentId = null) => {
        const key = getReplyKey(commentId, parentId)
        setReplyMediaFiles(prev => ({
            ...prev,
            [key]: prev[key].filter((_, i) => i !== index)
        }))
    }
    const handleSubmitComment = async e => {
        e.preventDefault()
        if (!commentContent.trim()) {
            showToast('Escribe algo antes de comentar', 'warning')
            return
        }
        try {
            await execute(() =>
                commentService.createComment({
                    content: commentContent.trim(),
                    post: parseInt(id),
                    media_files: commentMediaFiles.map(file => ({
                        file,
                        media_type: mediaService.getMediaType(file)
                    }))
                })
            )
            resetCommentForm()
            loadComments()
            showToast('Comentario publicado exitosamente', 'success')
        } catch (err) {
            setCommentErrorMsg(err.message || 'Error al publicar comentario')
            showToast('No se pudo publicar el comentario', 'error')
        }
    }
    const resetCommentForm = () => {
        setCommentContent('')
        setCommentMediaFiles([])
        setCommentErrorMsg('')
        setIsFormOpen(false)
    }
    const handleReply = async (commentId, parentId = null) => {
        const key = getReplyKey(commentId, parentId)
        const content = parentId ? replyContents[parentId]?.[commentId] : replyContents[commentId]
        const files = replyMediaFiles[key] || []
        if (!content?.trim() && files.length === 0) {
            showToast('Agrega contenido o medios para responder', 'warning')
            return
        }
        try {
            await execute(() =>
                commentService.createComment({
                    content: content?.trim() || '',
                    post: parseInt(id),
                    parent: parentId || commentId,
                    media_files: files.map(file => ({
                        file,
                        media_type: mediaService.getMediaType(file)
                    }))
                })
            )
            resetReplyForm(commentId, parentId)
            loadComments()
            showToast('Respuesta publicada exitosamente', 'success')
        } catch (err) {
            setReplyErrorMsg(err.message || 'Error al publicar respuesta')
            showToast('No se pudo publicar la respuesta', 'error')
        }
    }
    const resetReplyForm = (commentId, parentId = null) => {
        const key = getReplyKey(commentId, parentId)

        setReplyContents(prev =>
            parentId
                ? { ...prev, [parentId]: { ...prev[parentId], [commentId]: '' } }
                : { ...prev, [commentId]: '' }
        )
        setReplyMediaFiles(prev => ({ ...prev, [key]: [] }))
        setReplyingTo(null)
    }
    const handleStartReply = (commentId, parentId = null) => {
        setReplyingTo(getReplyKey(commentId, parentId))
        setReplyContents(prev =>
            parentId
                ? { ...prev, [parentId]: { ...prev[parentId], [commentId]: prev[parentId]?.[commentId] || '' } }
                : { ...prev, [commentId]: prev[commentId] || '' }
        )
    }
    const handleReplyContentChange = (text, commentId, parentId = null) => {
        setReplyContents(prev =>
            parentId
                ? { ...prev, [parentId]: { ...prev[parentId], [commentId]: text } }
                : { ...prev, [commentId]: text }
        )
    }
    const toggleReplies = id =>
        setExpandedReplies(prev => ({ ...prev, [id]: !prev[id] }))
    const filteredComments = useMemo(
        () =>
            comments.filter(c =>
                c.profile?.username?.toLowerCase().includes(searchTerm.toLowerCase())
            ),
        [comments, searchTerm]
    )
    const renderPostMedia = () =>
        post?.media_files?.length > 0 && (
            <div className="post-media-gallery">
                {post.media_files.map(media => {
                    const url = media.file_url || mediaService.getMediaUrl(media.file_id)
                    if (!url) return null
                    return (
                        <div key={media.id} className="media-item">
                            {media.media_type === 'image' ? (
                                <img
                                    src={url}
                                    alt=""
                                    onError={e => (e.target.src = '/img/placeholder-image.jpg')}
                                />
                            ) : (
                                <video controls>
                                    <source src={url} type={media.content_type} />
                                </video>
                            )}
                        </div>
                    )
                })}
            </div>
        )
    const renderReplyMediaSection = (commentId, parentId = null) => {
        const key = getReplyKey(commentId, parentId)
        const files = replyMediaFiles[key] || []
        if (!files.length) return null
        return (
            <div className="media-preview">
                {files.map((file, index) => (
                    <div key={index} className="media-item">
                        <span>{file.name} ({mediaService.getMediaType(file)})</span>
                        <button type="button" onClick={() => removeReplyFile(index, commentId, parentId)} className="remove-file-btn">✕</button>
                    </div>
                ))}
            </div>
        )
    }
    if (loading && !post)
        return (
            <div className="loading-container">
                <div>Cargando publicación...</div>
                <button onClick={() => navigate('/forum')} className="back-button">Volver al Foro</button>
            </div>
        )
    if (error && !post)
        return (
            <div className="error-container">
                <p>{error}</p>
                <button onClick={() => navigate('/forum')} className="back-button">Volver al Foro</button>
            </div>
        )
    if (!post)
        return (
            <div className="error-container">
                <p>Publicación no encontrada</p>
                <button onClick={() => navigate('/forum')} className="back-button">Volver al Foro</button>
            </div>
        )
    const postUsername = post.username || post.profile?.username || 'Usuario'
    const postAvatarUrl =
        postUsername !== 'Usuario'
            ? `http://localhost:8000/users/profiles/${postUsername}/avatar/`
            : '/defaultPFP.jpg'
    return (
        <div className="post-detail-page">
            <Sidebar />
            <div className="main-content">
                <div className="post-detail-container">
                    <button onClick={() => navigate('/forum')} className="back-button">Volver al Foro</button>
                    <div className="post-card">
                        <div className="post-header">
                            <img src={postAvatarUrl} alt="Avatar" className="post-avatar" onError={e => (e.target.src = '/defaultPFP.jpg')}/>
                            <div className="post-user-info">
                                <span className="post-username">{postUsername}</span>
                                <span className="post-date">{new Date(post.created_at).toLocaleString()}</span>
                            </div>
                        </div>
                        <h1 className="post-title">{post.title}</h1>
                        <div className="post-content">
                            <p>{post.content}</p>
                        </div>
                        {renderPostMedia()}
                        <div className="post-categories">
                            {post.categories?.length
                                ? post.categories.map(cat => (
                                        <span key={cat.id} className="category-tag">#{cat.name}</span>
                                    ))
                                : <span className="category-tag">Sin categoría</span>
                            }
                        </div>
                        <div className="post-stats">
                            <button className={`like-btn ${post.user_reaction === 'like' ? 'active' : ''}`} onClick={handleLikePost} disabled={!user || user.isGuest}>
                                <img src="/like.png" className="icono-negro" /> {post.likes_count || 0}
                            </button>
                            <button className={`dislike-btn ${post.user_reaction === 'dislike' ? 'active' : ''}`} onClick={handleDislikePost} disabled={!user || user.isGuest}>
                                <img src="/dislike.png" className="icono-negro" /> {post.dislikes_count || 0}
                            </button>
                            <span>
                                <img src="/comment.png" className="icono-negro" /> Respuestas: {post.comments_count || 0}
                            </span>
                            <span>
                                <img src="/views.png" className="icono-negro" /> Vistas: {post.views_count || 0}
                            </span>
                        </div>

                        {post && post.profile && (
                            <div className="post-report-section">
                                <ReportButton 
                                    contentType="post"
                                    contentId={post.id}
                                    contentAuthorId={post.profile.id}
                                    onReportSubmitted={() => {
                                    }}
                                />
                            </div>
                        )}
                    </div>
                    <div className="comments-section">
                        <div className="comments-header">
                            <h3>Comentarios ({comments.length})</h3>
                            <input type="text" placeholder="Buscar por usuario..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="search-input"/>
                            {user && !user.isGuest && (
                                <button className="btn-new-comment" onClick={() => setIsFormOpen(v => !v)} > {isFormOpen ? 'Cancelar' : 'Nuevo Comentario'}</button>
                            )}
                        </div>
                        {isFormOpen && (
                            <form className="comment-form" onSubmit={handleSubmitComment}>
                                {commentErrorMsg && <p className="error-message">{commentErrorMsg}</p>}
                                <textarea value={commentContent} onChange={e => setCommentContent(e.target.value)} placeholder="Escribe tu comentario..." rows="4" className="comment-textarea" />
                                <div className="media-section">
                                    <label className="file-input-label">
                                        <input type="file" multiple accept="image/*,video/*" onChange={handleCommentFileSelect} className="file-input" /> Agregar medios
                                    </label>
                                    {commentMediaFiles.length > 0 && (
                                        <div className="media-preview">
                                            {commentMediaFiles.map((file, i) => (
                                                <div key={i} className="media-item">
                                                    <span>{file.name} ({mediaService.getMediaType(file)})</span>
                                                    <button type="button" className="remove-file-btn"onClick={() => removeCommentFile(i)}>✕</button>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                                <button type="submit" className="btn-submit" disabled={!commentContent.trim()}>Publicar Comentario</button>
                            </form>
                        )}
                        {replyErrorMsg && <p className="error-message">{replyErrorMsg}</p>}
                        <div className="comments-list">
                            {filteredComments.length === 0 ? (
                                <div className="no-comments">
                                    {searchTerm
                                        ? 'No se encontraron comentarios con ese usuario'
                                        : 'Sé el primero en comentar'}
                                </div>
                            ) : (
                                filteredComments.map(comment => (
                                    <CommentSection 
                                        key={comment.id} 
                                        comment={comment} 
                                        onLike={handleLike} 
                                        onDislike={handleDislike} 
                                        currentUser={user} 
                                        replyingTo={replyingTo} 
                                        replyContents={replyContents}
                                        expandedReplies={expandedReplies} 
                                        onStartReply={handleStartReply} 
                                        onCancelReply={() => setReplyingTo(null)} 
                                        onReplyContentChange={handleReplyContentChange}
                                        onReply={handleReply} 
                                        onToggleReplies={toggleReplies} 
                                        renderReplyMediaSection={renderReplyMediaSection} 
                                        handleReplyFileSelect={handleReplyFileSelect} 
                                    />
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
export default PostPage