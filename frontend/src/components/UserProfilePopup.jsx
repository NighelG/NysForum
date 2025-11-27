import React, { useState, useEffect, useCallback } from 'react'
import { useavatar } from '../hooks/useavatar'
import { postService } from '../services/postService'
import { commentService } from '../services/commentService'
import { authService } from '../services/authService'
import '../styles/UserProfilePopup.css'

const UserProfilePopup = ({ username, isOpen, onClose }) => {
    const [activeTab, setActiveTab] = useState('posts')
    const [userData, setUserData] = useState(null)
    const [userPosts, setUserPosts] = useState([])
    const [userComments, setUserComments] = useState([])
    const [loading, setLoading] = useState(false)
    const [postsLoading, setPostsLoading] = useState(false)
    const [commentsLoading, setCommentsLoading] = useState(false)
    const avatarUrl = useavatar(username)
    useEffect(() => {
        if (!isOpen) {
            setUserData(null)
            setUserPosts([])
            setUserComments([])
            setActiveTab('posts')
        } else if (username) {
            setUserData(null)
            setUserPosts([])
            setUserComments([])
            setActiveTab('posts')
        }
    }, [isOpen, username])
    useEffect(() => {
        if (isOpen && username) {
            loadUserData()
        }
    }, [isOpen, username])
    useEffect(() => {
        if (!isOpen || !userData) return

        const loadTabContent = async () => {
            if (activeTab === 'posts' && userPosts.length === 0) {
                await loadUserPosts()
            } else if (activeTab === 'comments' && userComments.length === 0) {
                await loadUserComments()
            }
        }
        loadTabContent()
    }, [activeTab, isOpen, userData])
    useEffect(() => {
        const handleEscKey = (event) => {
            if (event.keyCode === 27 && isOpen) {
                onClose()
            }
        }
        if (isOpen) {
            document.addEventListener('keydown', handleEscKey)
        }
        return () => {
            document.removeEventListener('keydown', handleEscKey)
        }
    }, [isOpen, onClose])
    const loadUserData = useCallback(async () => {
        if (!username) return
        
        setLoading(true)
        try {
            const profileData = await authService.getUserProfile(username)
            setUserData(profileData)
        } catch (error) {
            console.error('Error cargando datos del usuario:', error)
            setUserData(null)
        } finally {
            setLoading(false)
        }
    }, [username])
    const loadUserPosts = useCallback(async () => {
        if (!userData?.id) return
        setPostsLoading(true)
        try {
            const posts = await postService.getPostsByUserId(userData.id)
            setUserPosts(posts)
        } catch (error) {
            console.error('Error cargando posts del usuario:', error)
            setUserPosts([])
        } finally {
            setPostsLoading(false)
        }
    }, [userData])
    const loadUserComments = useCallback(async () => {
        if (!userData?.id) return
        
        setCommentsLoading(true)
        try {
            const comments = await commentService.getCommentsByUserId(userData.id)
            setUserComments(comments)
        } catch (error) {
            console.error('Error cargando comentarios del usuario:', error)
            setUserComments([])
        } finally {
            setCommentsLoading(false)
        }
    }, [userData])
    const handleTabChange = useCallback((tab) => {
        setActiveTab(tab)
    }, [])
    if (!isOpen) return null
    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        })
    }
    const formatContent = (content, maxLength = 150) => {
        if (!content) return ''
        return content.length > maxLength 
            ? `${content.substring(0, maxLength)}...` 
            : content
    }

    return (
        <div className="user-profile-modal-overlay" onClick={onClose}>
            <div 
                className="user-profile-modal" 
                onClick={(e) => e.stopPropagation()}
            >
                <div className="modal-header">
                    <div className="user-basic-info">
                        <img 
                            src={avatarUrl} 
                            alt={`Avatar de ${username}`}
                            className="user-modal-avatar"
                        />
                        <div className="user-details">
                            <h3 className="username">@{username}</h3>
                            {userData && (
                                <>
                                    <p className="user-bio">{userData.bio || 'Sin biografía'}</p>
                                    <div className="user-meta">
                                        <span className="join-date">
                                            Se unió {formatDate(userData.date_joined)}
                                        </span>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                    <button className="close-modal-btn" onClick={onClose}>×</button>
                </div>

                {userData && (
                    <div className="user-stats">
                        <div className="stat-item">
                            <span className="stat-number">{userData.posts_count || 0}</span>
                            <span className="stat-label">Publicaciones</span>
                        </div>
                        <div className="stat-item">
                            <span className="stat-number">{userData.comments_count || 0}</span>
                            <span className="stat-label">Comentarios</span>
                        </div>
                        <div className="stat-item">
                            <span className="stat-number">{userData.likes_received || 0}</span>
                            <span className="stat-label">Likes</span>
                        </div>
                    </div>
                )}
                <div className="modal-tabs">
                    <button className={`tab-button ${activeTab === 'posts' ? 'active' : ''}`} onClick={() => handleTabChange('posts')}>
                        <span className="tab-label">Publicaciones</span>
                        <span className="tab-count">{userPosts.length}</span>
                    </button>
                    <button className={`tab-button ${activeTab === 'comments' ? 'active' : ''}`}onClick={() => handleTabChange('comments')}>
                        <span className="tab-label">Comentarios</span>
                        <span className="tab-count">{userComments.length}</span>
                    </button>
                </div>
                <div className="modal-content">
                    {loading ? (
                        <div className="loading-indicator">
                            <div className="spinner"></div>
                            <p>Cargando perfil...</p>
                        </div>
                    ) : (
                        <>
                            {activeTab === 'posts' && (
                                <div className="posts-section">
                                    {postsLoading ? (
                                        <div className="loading-indicator">
                                            <div className="spinner"></div>
                                            <p>Cargando publicaciones...</p>
                                        </div>
                                    ) : userPosts.length === 0 ? (
                                        <div className="no-content">
                                            <p>No hay publicaciones todavía</p>
                                        </div>
                                    ) : (
                                        userPosts.map(post => (
                                            <div key={post.id} className="content-item post-item">
                                                <div className="post-header">
                                                    <img src={avatarUrl} alt={`Avatar de ${username}`}className="post-author-avatar"/>
                                                    <div className="post-author-info">
                                                        <span className="post-author-name">@{username}</span>
                                                        <span className="post-date">· {formatDate(post.created_at)}</span>
                                                    </div>
                                                </div>
                                                <div className="post-content">
                                                    <p>{post.content}</p>
                                                    {post.categories && post.categories.length > 0 && (
                                                        <div className="post-categories">
                                                            {post.categories.map(cat => (
                                                                <span key={cat.id} className="category-tag">#{cat.name}</span>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="post-stats">
                                                    <span className="post-stat">
                                                        {post.comments_count || 0}
                                                    </span>
                                                    <span className="post-stat">
                                                        <img className='icono-negro' src="/like.png" alt="Likes" /> {post.likes_count || 0}
                                                    </span>
                                                    <span className="post-stat">
                                                        <img className='icono-negro' src="/dislike.png" alt="Dislikes" /> {post.dislikes_count || 0}
                                                    </span>
                                                    <span className="post-stat">
                                                        <img className='icono-negro' src="/views.png" alt="Vistas" /> {post.views_count || 0}
                                                    </span>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            )}
                            {activeTab === 'comments' && (
                                <div className="comments-section">
                                    {commentsLoading ? (
                                        <div className="loading-indicator">
                                            <div className="spinner"></div>
                                            <p>Cargando comentarios...</p>
                                        </div>
                                    ) : userComments.length === 0 ? (
                                        <div className="no-content">
                                            <p>No hay comentarios todavía</p>
                                        </div>
                                    ) : (
                                        userComments.map(comment => (
                                            <div key={comment.id} className="content-item comment-item">
                                                <div className="comment-header">
                                                    <img src={avatarUrl} alt={`Avatar de ${username}`}className="comment-author-avatar"/>
                                                    <div className="comment-author-info">
                                                        <span className="comment-author-name">@{username}</span>
                                                        <span className="comment-date">· {formatDate(comment.created_at)}</span>
                                                    </div>
                                                </div>
                                                <div className="comment-content">
                                                    <p>{comment.content}</p>
                                                </div>
                                                {comment.post && (
                                                    <div className="comment-context">
                                                        <div className="context-header">
                                                            <span> Comentario en:</span>
                                                        </div>
                                                        <div className="post-preview">
                                                            <strong>{comment.post.title}</strong>
                                                            {comment.post.content && (
                                                                <p className="post-excerpt">
                                                                    {formatContent(comment.post.content, 100)}
                                                                </p>
                                                            )}
                                                        </div>
                                                    </div>
                                                )}
                                                <div className="comment-stats">
                                                    <span className="comment-stat">
                                                        <img className='icono-negro' src="/like.png" alt="Likes" /> {comment.likes_count || 0}
                                                    </span>
                                                    <span className="comment-stat">
                                                        <img className='icono-negro' src="/dislike.png" alt="Dislikes" />{comment.dislikes_count || 0}
                                                    </span>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    )
}

export default React.memo(UserProfilePopup)