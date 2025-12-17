import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApi } from '../hooks/useApi'
import { postService } from '../services/postService'
import CreatePostDrawer from '../components/principal/CreatePostDrawer'
import Sidebar from '../components/SideBar'
import UserProfilePopup from '../components/principal/UserProfilePopup'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import '../styles/Forum.css'

const Forum = () => {
    const { loading, error, execute } = useApi()
    const [posts, setPosts] = useState([])
    const [searchName, setSearchName] = useState('')
    const [sortOrder, setSortOrder] = useState('nuevo')
    const [isDrawerOpen, setIsDrawerOpen] = useState(false)
    const navigate = useNavigate()
    const { user } = useAuth()
    const [selectedUser, setSelectedUser] = useState(null)
    const { showToast } = useToast()
    
    useEffect(() => {
        loadPosts()
    }, [])
    
    const loadPosts = async () => {
        try {
            const postsData = await execute(postService.getPosts)
            
            const adaptedPosts = postsData.map(post => {
                const username = post.username || post.profile?.user?.username || post.profile?.username || 'Usuario'
                return {
                    id: post.id,
                    title: post.title,
                    userName: username,
                    dateTime: post.created_at,
                    profileIcon: username !== 'Usuario' 
                        ? `http://localhost:8000/users/profiles/${username}/avatar/` 
                        : "/defaultPFP.jpg",
                    content: post.content,
                    categories: post.categories,
                    likes_count: post.likes_count,
                    dislikes_count: post.dislikes_count,
                    comments_count: post.comments_count,
                    views_count: post.views_count
                }
            })
            
            setPosts(adaptedPosts)
        } catch (err) {
            console.error('Error cargando posts:', err)
            showToast("Error cargando publicaciones", "error")
        }
    }
    
    const postClick = async (id) => {
        try {
            if (user && !user.isGuest) {
                await postService.incrementView(id);
            }
            navigate(`/posts/${id}`);
        } catch (error) {
            console.error('Error incrementando vista:', error);
            showToast("No se pudo registrar la visualización", "warning")
            navigate(`/posts/${id}`);
        }
    }
    
    const handleUserClick = (username, event) => {
        event.stopPropagation();
        setSelectedUser(username);
    }
    
    const filteredPosts = posts
        .filter(p => p.title.toLowerCase().includes(searchName.toLowerCase()))
        .sort((a, b) => {
            if (sortOrder === 'nuevo') {
                return new Date(b.dateTime) - new Date(a.dateTime)
            } else if (sortOrder === 'viejo') {
                return new Date(a.dateTime) - new Date(b.dateTime)
            }
            return 0
        })
    
    if (loading) return (
        <div className="forum-page">
            <div className="forum-loading">Cargando publicaciones...</div>
        </div>
    )
    
    if (error) return (
        <div className="forum-page">
            <div className="forum-error">Error: {error}</div>
        </div>
    )

    return (   
        <div className="forum-page">
            <div className="forum-header">
                <div className="forum-search-container">
                    <input className="forum-search" type="search" placeholder="Buscar discusiones..." value={searchName}  onChange={(e) => setSearchName(e.target.value)} />
                </div>
                <select className="forum-sort" value={sortOrder} onChange={(e) => setSortOrder(e.target.value)}>
                    <option value="nuevo">Más reciente</option>
                    <option value="viejo">Menos reciente</option>
                </select>
            </div>
            <h1 className="forum-title">Discusiones del Foro</h1>
            <div className="forum-posts-container">
                {filteredPosts.length === 0 ? (
                    <div className="forum-empty-state">
                        No se encontraron discusiones. ¡Sé el primero en crear una!
                    </div>
                ) : (
                    filteredPosts.map((post) => (
                        <div key={post.id} className="forum-discussion-card" onClick={() => postClick(post.id)}>
                            <div className="forum-discussion-header">
                                <img className="forum-user-avatar" src={post.profileIcon} alt="Avatar del usuario"
                                    onError={(e) => {
                                        e.target.src = "/defaultPFP.jpg"
                                    }} 
                                    onClick={(e) => handleUserClick(post.userName, e)}
                                />
                                <div className="forum-user-info">
                                    <span className="forum-username"onClick={(e) => handleUserClick(post.userName, e)}>{post.userName}</span>
                                    <div className="forum-post-date">{new Date(post.dateTime).toLocaleString()}</div>
                                </div>
                            </div>
                            <div className="forum-discussion-content">
                                <h3 className="forum-post-title">{post.title}</h3>
                                {post.content && (
                                    <div className="forum-post-excerpt">
                                        {post.content.length > 150 
                                            ? `${post.content.substring(0, 150)}...` 
                                            : post.content}
                                    </div>
                                )}
                                
                                <div className="forum-post-meta">
                                    <div className="forum-stat">
                                        <img className="forum-stat-icon" src="/like.png" alt="Likes" />
                                        <span>{post.likes_count}</span>
                                    </div>
                                    <div className="forum-stat">
                                        <img className="forum-stat-icon" src="/dislike.png" alt="Dislikes" />
                                        <span>{post.dislikes_count}</span>
                                    </div>
                                    <div className="forum-stat">
                                        <span>Respuestas: {post.comments_count}</span>
                                    </div>
                                    <div className="forum-stat">
                                        <img className="forum-stat-icon" src="/views.png" alt="Vistas" />
                                        <span>Vistas: {post.views_count}</span>
                                    </div>
                                </div>
                                {post.categories && post.categories.length > 0 ? (
                                    <div className="forum-categories">
                                        {post.categories.map(cat => (
                                            <span key={cat.id} className="forum-category-tag">
                                                #{cat.name}
                                            </span>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="forum-no-category">Sin categoría</div>
                                )}
                            </div>
                        </div>
                    ))
                )}
            </div>
            {user && !user.isGuest && (
                <div className="forum-create-button">
                    <button className="forum-create-fab" onClick={() => setIsDrawerOpen(true)}>
                        <span className="fab-text">Crear Publicación</span>
                    </button>
                </div>
            )}
            <Sidebar />
            <CreatePostDrawer isOpen={isDrawerOpen} setIsOpen={setIsDrawerOpen} onPostCreated={loadPosts}/>
            <UserProfilePopup username={selectedUser} isOpen={!!selectedUser} onClose={() => setSelectedUser(null)} />
        </div>
    )
}

export default Forum
