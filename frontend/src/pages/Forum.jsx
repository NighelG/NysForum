import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApi } from '../hooks/useApi'
import { postService } from '../services/postService'
import CreatePostDrawer from '../components/CreatePostDrawer';
import '../styles/Forum.css'

const Forum = () => {
    const { loading, error, execute } = useApi()
    const [posts, setPosts] = useState([])
    const [searchName, setSearchName] = useState('')
    const [sortOrder, setSortOrder] = useState('todas')
    const [isDrawerOpen, setIsDrawerOpen] = useState(false)
    const navigate = useNavigate()

    useEffect(() => {
        loadPosts()
    }, [])

    const loadPosts = async () => {
        try {
            const postsData = await execute(postService.getPosts)
            
            const adaptedPosts = postsData.map(post => ({
                id: post.id,
                title: post.title,
                userName: post.profile?.user?.username || 'Usuario',
                dateTime: post.created_at,
                profileIcon: post.profile?.avatar || "/defaultPFP.jpg",
                content: post.content,
                categories: post.categories,
                likes_count: post.likes_count,
                dislikes_count: post.dislikes_count,
                comments_count: post.comments_count,
                views_count: post.views_count
            }))
            
            setPosts(adaptedPosts)
        } catch (err) {
            console.error('Error cargando posts:', err)
        }
    }

    const postClick = (id) => {
        navigate(`/posts/${id}`)
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
            <img className='iconoEsquina' src="/nysforum-high-resolution-logo-transparent(1).png" alt="" />
            <br /><br />

            <div>
                <label>
                    <input className="search" type="search" placeholder='Buscar' value={searchName} onChange={(e) => setSearchName(e.target.value)} />
                </label>
                <select value={sortOrder} onChange={(e) => setSortOrder(e.target.value)}>
                    <option value="todas">---</option>
                    <option value="nuevo">Mas reciente</option>
                    <option value="viejo">Menos reciente</option>
                </select>
            </div>

            <div>
                <h2>Iniciar nueva discusión</h2>
                <button className='button' onClick={() => setIsDrawerOpen(true)}>
                    <img className='tinymedium' src="/img/discu.png" alt="Nueva discusión" />
                </button>
            </div>

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
                                <img className='profile-icon' src={post.profileIcon} alt="Avatar" />
                                <div className='user-details'>
                                    <span className='user-name'>{post.userName}</span>
                                    <span>{new Date(post.dateTime).toLocaleString()}</span>
                                </div>
                            </div>
                            <div className='discussion-title-container'>
                                <h3 className="discussion-title">{post.title}</h3>
                                <div className="post-stats">
                                    <span> + {post.likes_count}</span>
                                    <span> - {post.dislikes_count}</span>
                                    <span> comentar {post.comments_count}</span>
                                    <span> vistas {post.views_count}</span>
                                </div>
                                {post.categories && post.categories.length > 0 && (
                                    <div className="post-categories">
                                        {post.categories.map(cat => (
                                            <span key={cat.id} className="category-tag">#{cat.name}</span>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    ))
                )}
            </div>
            <CreatePostDrawer 
            isOpen={isDrawerOpen} 
            setIsOpen={setIsDrawerOpen} 
            onPostCreated={loadPosts}
            />
        </div>
    )
}

export default Forum