import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useApi } from '../hooks/useApi'
import { useAuth } from '../context/AuthContext'
import { postService } from '../services/postService'
import { commentService } from '../services/commentService'
import mediaService from '../services/mediaSerivce.js'
import Sidebar from '../components/Sidebar'
import CommentSection from '../components/CommentSection'
import '../styles/PostPage.css'

const PostPage = () => {
    const { id } = useParams()
    const navigate = useNavigate()
    const { user } = useAuth()
    const { execute, loading, error } = useApi()
    const [post, setPost] = useState(null)
    const [comments, setComments] = useState([])
    const [searchTerm, setSearchTerm] = useState('')
    const [isFormOpen, setIsFormOpen] = useState(false)
    const [commentContent, setCommentContent] = useState('')
    const [commentMediaFiles, setCommentMediaFiles] = useState([])
    const [commentErrorMsg, setCommentErrorMsg] = useState('')
    const [replyMediaFiles, setReplyMediaFiles] = useState({})
    const [replyErrorMsg, setReplyErrorMsg] = useState('')
    const [replyingTo, setReplyingTo] = useState(null)
    const [replyContents, setReplyContents] = useState({})
    const [expandedReplies, setExpandedReplies] = useState({})
    useEffect(() => {
        if (!id) return
        loadPost()
        loadComments()
    }, [id])
    const loadPost = async () => {
        try {
            const postData = await execute(() => postService.getPost(id))
            setPost(postData)
        } catch (err) {
            console.error('Error cargando post:', err)
        }
    }
    const loadComments = async () => {
        try {
            const all = await execute(commentService.getComments)
            if (!all || !Array.isArray(all)) return setComments([])
            const postComments = all.filter(c => c.post === parseInt(id))
            const adapted = postComments.map(c => ({
                id: c.id,
                content: c.content || '',
                created_at: c.created_at,
                profile: {
                    id: c.profile?.id ?? null,
                    avatar: c.profile?.username !== 'Usuario' ? 
                        `http://localhost:8000/users/profiles/${c.profile?.username}/avatar/` : 
                        '/defaultPFP.jpg',
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
            setComments([])
        }
    }
    const handleLikePost = async () => {
        if (!user || user.isGuest) return
        try {
            await execute(() => postService.reactToPost(post.id, 'like'))
            loadPost()
        } catch (err) {
            console.error('Error dando like al post:', err)
        }
    }
    const handleDislikePost = async () => {
        if (!user || user.isGuest) return
        try {
            await execute(() => postService.reactToPost(post.id, 'dislike'))
            loadPost()
        } catch (err) {
            console.error('Error dando dislike al post:', err)
        }
    }
    const handleLike = async commentId => {
        if (!user || user.isGuest) return
        try {
            await execute(() => commentService.reactToComment(commentId, 'like'))
            loadComments()
        } catch (err) {
            console.error('Error dando like:', err)
        }
    }
    const handleDislike = async commentId => {
        if (!user || user.isGuest) return
        try {
            await execute(() => commentService.reactToComment(commentId, 'dislike'))
            loadComments()
        } catch (err) {
            console.error('Error dando dislike:', err)
        }
    }
    const validateFile = (file) => {
        const mediaType = mediaService.getMediaType(file)
        const sizeError = mediaService.getSizeErrorMessage(file)
        
        if (!mediaService.validateFileType(file, mediaType)) {
            return { valid: false, error: `Tipo de archivo no soportado: ${file.name}` }
        }
        if (sizeError) {
            return { valid: false, error: sizeError }
        }
        return { valid: true, mediaType }
    }
    const handleCommentFileSelect = (event) => {
        const files = Array.from(event.target.files)
        const validFiles = files.filter(file => {
            const result = validateFile(file)
            if (!result.valid) {
                setCommentErrorMsg(result.error)
                return false
            }
            return true
        })
        setCommentMediaFiles(prev => [...prev, ...validFiles])
        setCommentErrorMsg('')
    }
    const removeCommentFile = (index) => {
        setCommentMediaFiles(prev => prev.filter((_, i) => i !== index))
        setCommentErrorMsg('')
    }
    const handleReplyFileSelect = (event, commentId, parentId = null) => {
        const files = Array.from(event.target.files)
        const validFiles = files.filter(file => {
            const result = validateFile(file)
            if (!result.valid) {
                setReplyErrorMsg(result.error)
                return false
            }
            return true
        })
        const key = parentId ? `${parentId}-${commentId}` : commentId
        setReplyMediaFiles(prev => ({
            ...prev,
            [key]: [...(prev[key] || []), ...validFiles]
        }))
        setReplyErrorMsg('')
    }
    const removeReplyFile = (index, commentId, parentId = null) => {
        const key = parentId ? `${parentId}-${commentId}` : commentId
        setReplyMediaFiles(prev => ({
            ...prev,
            [key]: prev[key].filter((_, i) => i !== index)
        }))
        setReplyErrorMsg('')
    }
    const handleSubmitComment = async e => {
        e.preventDefault()
        if (!commentContent.trim() || !user || user.isGuest) return
        try {
            const commentData = {
                content: commentContent.trim(),
                post: parseInt(id),
                media_files: commentMediaFiles.map(file => ({
                    file: file,
                    media_type: mediaService.getMediaType(file)
                }))
            }
            await execute(() => commentService.createComment(commentData))
            resetCommentForm()
            loadComments()
        } catch (err) {
            console.error('Error publicando comentario:', err)
            setCommentErrorMsg(err.message || 'Error al publicar comentario')
        }
    }
    const resetCommentForm = () => {
        setCommentContent('')
        setCommentMediaFiles([])
        setCommentErrorMsg('')
        setIsFormOpen(false)
    }
    const handleReply = async (commentId, parentId = null) => {
        if (!user || user.isGuest) return
        const key = parentId ? `${parentId}-${commentId}` : commentId
        const replyContent = parentId ? replyContents[parentId]?.[commentId] : replyContents[commentId]
        const files = replyMediaFiles[key] || []
        if (!replyContent?.trim() && files.length === 0) return
        try {
            const replyData = {
                content: replyContent?.trim() || '',
                post: parseInt(id),
                parent: parentId || commentId,
                media_files: files.map(file => ({
                    file: file,
                    media_type: mediaService.getMediaType(file)
                }))
            }
            await execute(() => commentService.createComment(replyData))
            resetReplyForm(commentId, parentId)
            loadComments()
        } catch (err) {
            console.error('Error publicando respuesta:', err)
            setReplyErrorMsg(err.message || 'Error al publicar respuesta')
        }
    }
    const resetReplyForm = (commentId, parentId = null) => {
        const key = parentId ? `${parentId}-${commentId}` : commentId
        if (parentId) {
            setReplyContents(prev => ({ 
                ...prev, 
                [parentId]: { ...prev[parentId], [commentId]: '' } 
            }))
        } else {
            setReplyContents(prev => ({ ...prev, [commentId]: '' }))
        }
        setReplyMediaFiles(prev => ({ ...prev, [key]: [] }))
        setReplyingTo(null)
    }
    const handleStartReply = (commentId, parentId = null) => {
        setReplyingTo(parentId ? `${parentId}-${commentId}` : commentId)
        if (parentId) {
            setReplyContents(prev => ({ 
                ...prev, 
                [parentId]: { ...prev[parentId], [commentId]: prev[parentId]?.[commentId] || '' } 
            }))
        } else {
            setReplyContents(prev => ({ ...prev, [commentId]: prev[commentId] || '' }))
        }
    }
    const handleCancelReply = () => {
        setReplyingTo(null)
        setReplyErrorMsg('')
    }
    const handleReplyContentChange = (content, commentId, parentId = null) => {
        if (parentId) {
            setReplyContents(prev => ({ 
                ...prev, 
                [parentId]: { ...prev[parentId], [commentId]: content } 
            }))
        } else {
            setReplyContents(prev => ({ ...prev, [commentId]: content }))
        }
    }
    const toggleReplies = commentId => setExpandedReplies(prev => ({ 
        ...prev, 
        [commentId]: !prev[commentId] 
    }))
    const filteredComments = comments.filter(c => 
        (c.profile?.username || 'Usuario').toLowerCase().includes(searchTerm.toLowerCase())
    )
    const renderPostMedia = () => {
        if (!post?.media_files || post.media_files.length === 0) return null
        return (
            <div className="post-media-gallery">
                {post.media_files.map(media => {
                    const mediaUrl = media.file_url || mediaService.getMediaUrl(media.file_id)
                    if (!mediaUrl) return null
                    return (
                        <div key={media.id} className="media-item">
                            {media.media_type === 'image' && (
                                <img src={mediaUrl} alt={`Media de ${post.title}`}
                                    onError={(e) => {
                                        e.target.src = '/img/placeholder-image.jpg'
                                        console.error('Error cargando imagen:', mediaUrl)
                                    }}
                                />
                            )}
                            {media.media_type === 'video' && (
                                <video controls><source src={mediaUrl} type={media.content_type} />Tu navegador no soporta el elemento video.</video>
                            )}
                        </div>
                    )
                })}
            </div>
        )
    }
    const renderCommentMediaSection = () => (
        <div className="media-section">
            <label className="file-input-label">
                <input type="file" multiple accept="image/*,video/*" onChange={handleCommentFileSelect} className="file-input"/> Agregar medios
            </label>
            {commentMediaFiles.length > 0 && (
                <div className="media-preview">
                    {commentMediaFiles.map((file, index) => (
                        <div key={index} className="media-item">
                            <span>{file.name} ({mediaService.getMediaType(file)})</span>
                            <button type="button" onClick={() => removeCommentFile(index)}className="remove-file-btn">✕</button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
    const renderReplyMediaSection = (commentId, parentId = null) => {
        const key = parentId ? `${parentId}-${commentId}` : commentId
        const files = replyMediaFiles[key] || []
        if (files.length === 0) return null
        return (
            <div className="media-preview">
                {files.map((file, index) => (
                    <div key={index} className="media-item">
                        <span>{file.name} ({mediaService.getMediaType(file)})</span>
                        <button type="button" onClick={() => removeReplyFile(index, commentId, parentId)}className="remove-file-btn">✕</button>
                    </div>
                ))}
            </div>
        )
    }
    if (loading && !post) return (
        <div className="loading-container">
            <div>Cargando publicación...</div>
            <button onClick={() => navigate('/forum')} className="back-button">Volver al Foro</button>
        </div>
    )
    if (error && !post) return (
        <div className="error-container">
            <p>{error}</p>
            <button onClick={() => navigate('/forum')} className="back-button">Volver al Foro</button>
        </div>
    )
    if (!post) return (
        <div className="error-container">
            <p>Publicación no encontrada</p>
            <button onClick={() => navigate('/forum')} className="back-button">Volver al Foro</button>
        </div>
    )
    const postUsername = post.username || post.profile?.username || 'Usuario'
    const postAvatarUrl = postUsername !== 'Usuario' 
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
                            <img src={postAvatarUrl} alt="Avatar" className="post-avatar" onError={e => e.target.src = '/defaultPFP.jpg'} />
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
                        {post.categories?.length > 0 ? (
                            <div className="post-categories">
                                {post.categories.map(cat => 
                                    <span key={cat.id} className="category-tag">#{cat.name}</span>
                                )}
                            </div>
                        ) : (
                            <div className="post-categories no-cat">
                                <span className="category-tag">Sin categoría</span>
                            </div>
                        )}
                        <div className="post-stats">
                            <button className={`like-btn ${post.user_reaction === 'like' ? 'active' : ''}`} onClick={handleLikePost} disabled={!user || user.isGuest}>
                                <img className='icono-negro' src="/like.png" alt="Likes" /> 
                                {post.likes_count || 0}
                            </button>
                            <button className={`dislike-btn ${post.user_reaction === 'dislike' ? 'active' : ''}`} onClick={handleDislikePost} disabled={!user || user.isGuest}>
                                <img className='icono-negro' src="/dislike.png" alt="Dislikes" /> 
                                {post.dislikes_count || 0}
                            </button>
                            <span>
                                <img className='icono-negro' src="/comment.png" alt="Comments" /> 
                                Respuestas: {post.comments_count || 0}
                            </span>
                            <span>
                                <img className='icono-negro' src="/views.png" alt="Vistas" /> 
                                Vistas: {post.views_count || 0}
                            </span>
                        </div>
                    </div>
                    <div className="comments-section">
                        <div className="comments-header">
                            <h3>Comentarios ({comments.length})</h3>
                            <input type="text" placeholder="Buscar por usuario..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="search-input" />
                            {user && !user.isGuest && (
                                <button className="btn-new-comment" onClick={() => setIsFormOpen(!isFormOpen)} >
                                    {isFormOpen ? 'Cancelar' : 'Nuevo Comentario'}
                                </button>
                            )}
                        </div>
                        
                        {isFormOpen && (
                            <form className="comment-form" onSubmit={handleSubmitComment}>
                                {commentErrorMsg && <p className="error-message">{commentErrorMsg}</p>}
                                <textarea value={commentContent} onChange={e => setCommentContent(e.target.value)} placeholder="Escribe tu comentario..." className="comment-textarea" rows="4" />
                                {renderCommentMediaSection()}
                                <button type="submit" disabled={!commentContent.trim()} className="btn-submit">Publicar Comentario</button>
                            </form>
                        )}
                        
                        {replyErrorMsg && (
                            <div className="error-message">{replyErrorMsg}</div>
                        )}
                        
                        <div className="comments-list">
                            {filteredComments.length === 0 ? (
                                <div className="no-comments">
                                    {searchTerm ? 'No se encontraron comentarios con ese usuario' : 'Sé el primero en comentar'}
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
                                        onCancelReply={handleCancelReply}
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