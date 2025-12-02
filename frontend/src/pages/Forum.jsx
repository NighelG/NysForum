import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApi } from '../hooks/useApi'
import { postService } from '../services/postService'
import CreatePostDrawer from '../components/CreatePostDrawer'
import Sidebar from '../components/SideBar'
import UserProfilePopup from '../components/UserProfilePopup'
import { useAuth } from '../context/AuthContext'
import '../styles/Forum.css'

const Forum = () => {
    const { loading, error, execute } = useApi()
    const [posts, setPosts] = useState([])
    const [searchName, setSearchName] = useState('')
    const [sortOrder, setSortOrder] = useState('nuevo')
    const [isDrawerOpen, setIsDrawerOpen] = useState(false)
    const navigate = useNavigate()
    const { user } = useAuth()
    const [selectedUser, setSelectedUser] = useState(null);
    const [popupPosition, setPopupPosition] = useState({ x: 0, y: 0 })
    const handleUserClick = (username, event) => {
        event.stopPropagation();
        setSelectedUser(username);
    }
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
                navigate(`/posts/${id}`);
            }
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
    if (loading) return <div>Cargando publicaciones...</div>
    if (error) return <div>Error: {error}</div>

    return (   
        <div className='lobbybody'>
            <div>
                <label>
                    <input className="search" type="search" placeholder='Buscar'  value={searchName} onChange={(e) => setSearchName(e.target.value)} />
                </label>
                <select value={sortOrder} onChange={(e) => setSortOrder(e.target.value)}>
                    <option value="nuevo">Mas reciente</option>
                    <option value="viejo">Menos reciente</option>
                </select>
            </div>
            {user && !user.isGuest && (
                <div className="floating-create-button">
                    <button className='create-post-fab' onClick={() => setIsDrawerOpen(true)}>
                        <span className="fab-text">Crear Publicación</span>
                    </button>
                </div>
            )}
            <br />
            <p>Discusiónes</p>
            <br />
            <div className='posts-container'>
                {filteredPosts.length === 0 ? (
                    <p>Sin resultados</p>
                ) : (
                    filteredPosts.map((post) => (
                        <div key={post.id} className='discussion-card' onClick={() => postClick(post.id)}>
                            <div className='user-info'>
                                <img className='profile-icon' src={post.profileIcon} alt="Avatar" 
                                    onError={(e) => {
                                        e.target.src = "/defaultPFP.jpg"
                                    }} onClick={(e) => handleUserClick(post.userName, e)} style={{ cursor: 'pointer' }}/>
                                <div className='user-details'>
                                    <span className='user-name'onClick={(e) => handleUserClick(post.userName, e)}style={{ cursor: 'pointer' }}>
                                        {post.userName}
                                    </span>
                                    <span>{new Date(post.dateTime).toLocaleString()}</span>
                                </div>
                            </div>
                            <div className='discussion-title-container'>
                                <h3 className="discussion-title">{post.title}</h3>
                                <div className="post-stats">
                                    <span> 
                                        <img className='icono-negro' src="/like.png" alt="Likes" /> 
                                        {post.likes_count}
                                    </span>
                                    <span> 
                                        <img className='icono-negro' src="/dislike.png" alt="Dislikes" /> 
                                        {post.dislikes_count}
                                    </span>
                                    <span> Respuestas: {post.comments_count}</span>
                                    <span> 
                                        <img className='icono-negro' src="/views.png" alt="Vistas" /> 
                                        Vistas: {post.views_count}
                                    </span>
                                </div>
                                {post.categories && post.categories.length > 0 ? (
                                    <div className="post-categories">
                                        {post.categories.map(cat => (
                                            <span key={cat.id} className="category-tag">#{cat.name}</span>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="post-categories no-cat">
                                        <span className="category-tag">Sin categoría</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))
                )}
            </div>
            <Sidebar />
            <CreatePostDrawer 
                isOpen={isDrawerOpen} 
                setIsOpen={setIsDrawerOpen} 
                onPostCreated={loadPosts}
            />
            <UserProfilePopup 
                username={selectedUser}
                isOpen={!!selectedUser}
                onClose={() => setSelectedUser(null)}
            />
        </div>
    )
}

export default Forum