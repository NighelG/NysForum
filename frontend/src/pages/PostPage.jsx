import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useApi } from '../hooks/useApi'
import { useAuth } from '../context/AuthContext'
import { postService } from '../services/postService'
import { commentService } from '../services/commentService'
import Sidebar from '../components/SideBar'
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

    useEffect(() => {
        if (id) {
            loadPost()
            loadComments()
        }
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
            const allComments = await execute(commentService.getComments)
            
            if (allComments && Array.isArray(allComments)) {
                const postComments = allComments.filter(comment => 
                    comment.post === parseInt(id)
                )
                
                const adaptedComments = postComments.map(comment => ({
                    id: comment.id,
                    content: comment.content || '',
                    created_at: comment.created_at,
                    profile: {
                        avatar: comment.profile?.avatar || "/defaultPFP.jpg",
                        user: { 
                            username: comment.profile?.user?.username || 'Usuario' 
                        }
                    },
                    likes_count: comment.likes_count || 0,
                    dislikes_count: comment.dislikes_count || 0,
                    replies: comment.replies || []
                }))
                
                setComments(adaptedComments)
            }
        } catch (err) {
            console.error('Error cargando comentarios:', err)
            setComments([])
        }
    }
    const filteredComments = comments.filter(comment =>
        comment.profile.user.username.toLowerCase().includes(searchTerm.toLowerCase())
    )
    const handleLike = async (commentId) => {
        if (!user || user.isGuest) return
        try {
            await execute(() => commentService.reactToComment(commentId, 'like'))
            loadComments()
        } catch (err) {
            console.error('Error dando like:', err)
        }
    }
    const handleSubmitComment = async (e) => {
        e.preventDefault()
        if (!commentContent.trim() || !user || user.isGuest) return
        try {
            await execute(() => commentService.createComment({
                content: commentContent.trim(),
                post: parseInt(id)
            }))
            
            setCommentContent('')
            setIsFormOpen(false)
            loadComments()
        } catch (err) {
            console.error('Error publicando comentario:', err)
        }
    }
    const CommentItem = ({ comment, onLike, currentUser }) => {
        return (
            <div className="comment-item" key={comment.id}>
                <div className="comment-header">
                    <img src={comment.profile.avatar} alt="Avatar" className="comment-avatar" />
                    <div className="comment-user-info">
                        <span className="comment-username">{comment.profile.user.username}</span>
                        <span className="comment-date">{new Date(comment.created_at).toLocaleString()}</span>
                    </div>
                </div>
                <div className="comment-content">
                    <p>{comment.content}</p>
                </div>
                <div className="comment-actions">
                    <button 
                        className="like-btn"
                        onClick={() => onLike(comment.id)}
                        disabled={!currentUser || currentUser.isGuest}
                    >
                        {comment.likes_count}
                    </button>
                </div>
                {comment.replies && comment.replies.length > 0 && (
                    <div className="replies-container">
                        {comment.replies.map(reply => (
                            <div key={reply.id} className="reply-item">
                                <div className="comment-header">
                                    <img src={reply.profile.avatar} alt="Avatar" className="comment-avatar" />
                                    <div className="comment-user-info">
                                        <span className="comment-username">{reply.profile.user.username}</span>
                                        <span className="comment-date">{new Date(reply.created_at).toLocaleString()}</span>
                                    </div>
                                </div>
                                <div className="comment-content">
                                    <p>{reply.content}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        )
    }
    if (loading && !post) {
        return (
            <div className="loading-container">
                <div>Cargando publicación...</div>
                <button onClick={() => navigate('/forum')} className="back-button">Volver al Foro</button>
            </div>
        )
    }
    if (error && !post) {
        return (
            <div className="error-container">
                <p>{error}</p>
                <button onClick={() => navigate('/forum')} className="back-button">Volver al Foro</button>
            </div>
        )
    }
    if (!post) {
        return (
            <div className="error-container">
                <p>Publicación no encontrada</p>
                <button onClick={() => navigate('/forum')} className="back-button">Volver al Foro</button>
            </div>
        )
    }
    return (
        <div className="post-detail-page">
            <Sidebar />
            <div className="main-content">
                <div className="post-detail-container">
                    <button onClick={() => navigate('/forum')} className="back-button">Volver al Foro</button>
                    <div className="post-card">
                        <div className="post-header">
                            <img src={post.profile?.avatar || "/defaultPFP.jpg"} alt="Avatar" className="post-avatar" />
                            <div className="post-user-info">
                                <span className="post-username">{post.profile?.user?.username || 'Usuario'}</span>
                                <span className="post-date">{new Date(post.created_at).toLocaleString()}</span>
                            </div>
                        </div>
                        
                        <h1 className="post-title">{post.title}</h1>
                        
                        <div className="post-content">
                            <p>{post.content}</p>
                        </div>
                        {post.media_files?.length > 0 && (
                            <div className="post-media-gallery">
                                {post.media_files.map(media => (
                                    <div key={media.id} className="media-item">
                                        {media.media_type === 'image' && (
                                            <img src={media.file} alt="Post media" />
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                        {post.categories?.length > 0 && (
                            <div className="post-categories">
                                {post.categories.map(cat => (
                                    <span key={cat.id} className="category-tag">#{cat.name}</span>
                                ))}
                            </div>
                        )}
                        <div className="post-stats">
                            <span><img className='nav-icon-img' src="/like.png" alt="Likes" /> {post.likes_count || 0}</span>
                            <span><img className='nav-icon-img' src="/dislike.png" alt="Dislikes" /> {post.dislikes_count || 0}</span>
                            <span>Respuestas: {post.comments_count || 0}</span>
                            <span><img className='nav-icon-img' src="/views.png" alt="Vistas" /> Vistas: {post.views_count || 0}</span>
                        </div>
                    </div>
                    <div className="comments-section">
                        <div className="comments-header">
                            <h3>Comentarios ({comments.length})</h3>
                            <input type="text" placeholder="Buscar por usuario..." value={searchTerm}onChange={(e) => setSearchTerm(e.target.value)} className="search-input"/>
                            {user && !user.isGuest && (
                                <button className="btn-new-comment" onClick={() => setIsFormOpen(!isFormOpen)}>
                                    {isFormOpen ? 'Cancelar' : 'Nuevo Comentario'}
                                </button>
                            )}
                        </div>
                        {isFormOpen && (
                            <form className="comment-form" onSubmit={handleSubmitComment}>
                                <textarea value={commentContent} onChange={(e) => setCommentContent(e.target.value)}placeholder="Escribe tu comentario..." className="comment-textarea" rows="4"/>
                                <button type="submit" disabled={!commentContent.trim()} className="btn-submit">Publicar Comentario</button>
                            </form>
                        )}

                        <div className="comments-list">
                            {filteredComments.length === 0 ? (
                                <div className="no-comments">
                                    {searchTerm 
                                        ? 'No se encontraron comentarios con ese usuario' 
                                        : 'Sé el primero en comentar'
                                    }
                                </div>
                            ) : (
                                filteredComments.map(comment => (
                                    <CommentItem key={comment.id} comment={comment} onLike={handleLike} currentUser={user} />
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