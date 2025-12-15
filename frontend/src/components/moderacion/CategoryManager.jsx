import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { categoryService } from '../../services/categoryService'
import '../../styles/CategoryManager.css'

const CategoryManager = ({ isAdmin }) => {
    const [categories, setCategories] = useState([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)
    const [searchTerm, setSearchTerm] = useState('')
    const [sortBy, setSortBy] = useState('name')
    
    const [formData, setFormData] = useState({
        id: null,
        name: '',
        description: '',
        isEditing: false
    })

    const fetchCategories = useCallback(async () => {
        try {
            setLoading(true)
            setError(null)
            const data = await categoryService.getCategories()
            setCategories(data)
        } catch (err) {
            setError('Error al cargar las categorías')
            console.error('Error fetching categories:', err)
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => {
        if (isAdmin) {
            fetchCategories()
        }
    }, [isAdmin, fetchCategories])

    const filteredAndSortedCategories = useMemo(() => {
        let filtered = categories

        if (searchTerm.trim()) {
            const term = searchTerm.toLowerCase().trim()
            filtered = filtered.filter(category => 
                category.name.toLowerCase().includes(term) ||
                (category.description && category.description.toLowerCase().includes(term))
            )
        }

        return [...filtered].sort((a, b) => {
            switch (sortBy) {
                case 'name':
                    return a.name.localeCompare(b.name)
                case 'posts':
                    return b.posts_count - a.posts_count
                case 'newest':
                    return new Date(b.created_at) - new Date(a.created_at)
                case 'oldest':
                    return new Date(a.created_at) - new Date(b.created_at)
                default:
                    return a.name.localeCompare(b.name)
            }
        })
    }, [categories, searchTerm, sortBy])

    const handleInputChange = useCallback((field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }))
    }, [])

    const handleCreateCategory = useCallback(async (e) => {
        e.preventDefault()
        
        if (!formData.name.trim()) {
            setError('El nombre es requerido')
            return
        }

        try {
            setLoading(true)
            setError(null)
            
            await categoryService.createCategory({
                name: formData.name.trim(),
                description: formData.description.trim() || ''
            })
            
            await fetchCategories()
            setFormData({ id: null, name: '', description: '', isEditing: false })
            
        } catch (err) {
            setError('Error al crear la categoría')
            console.error('Error creating category:', err)
        } finally {
            setLoading(false)
        }
    }, [formData, fetchCategories])

    const handleUpdateCategory = useCallback(async (e) => {
        e.preventDefault()
        
        if (!formData.name.trim()) {
            setError('El nombre es requerido')
            return
        }

        try {
            setLoading(true)
            setError(null)
            
            await categoryService.updateCategory(formData.id, {
                name: formData.name.trim(),
                description: formData.description.trim() || ''
            })
            
            await fetchCategories()
            setFormData({ id: null, name: '', description: '', isEditing: false })
            
        } catch (err) {
            setError('Error al actualizar la categoría')
            console.error('Error updating category:', err)
        } finally {
            setLoading(false)
        }
    }, [formData, fetchCategories])

    const handleDeleteCategory = useCallback(async (categoryId) => {
        if (!window.confirm('¿Estás seguro de que quieres eliminar esta categoría? Esto no eliminará los posts asociados.')) {
            return
        }
        try {
            setLoading(true)
            await categoryService.deleteCategory(categoryId)
            await fetchCategories()
        } catch (err) {
            setError('Error al eliminar la categoría')
            console.error('Error deleting category:', err)
        } finally {
            setLoading(false)
        }
    }, [fetchCategories])

    const startEditCategory = useCallback((category) => {
        setFormData({
            id: category.id,
            name: category.name,
            description: category.description || '',
            isEditing: true
        })
        window.scrollTo({ top: 0, behavior: 'smooth' })
    }, [])

    const cancelEdit = useCallback(() => {
        setFormData({ id: null, name: '', description: '', isEditing: false })
    }, [])

    const clearSearch = useCallback(() => {
        setSearchTerm('')
    }, [])

    if (!isAdmin) {
        return (
            <div className="access-denied">
                <h2>Acceso Restringido</h2>
                <p>Esta sección solo está disponible para administradores.</p>
            </div>
        )
    }

    return (
        <div className="category-manager">
            <div className="category-form-container">
                <h3 className="form-title">
                    {formData.isEditing ? 'Editar Categoría' : 'Nueva Categoría'}
                </h3>
                
                {error && (
                    <div className="error-message">
                        {error}
                    </div>
                )}
                
                <form onSubmit={formData.isEditing ? handleUpdateCategory : handleCreateCategory} className="category-form">
                    <div className="form-group">
                        <label htmlFor="categoryName">Nombre *</label>
                        <input type="text" id="categoryName" value={formData.name} onChange={(e) => handleInputChange('name', e.target.value)} placeholder="Ej: Programación"
                            maxLength={50} disabled={loading} required className="form-input"/>
                    </div>
                    <div className="form-group">
                        <label htmlFor="categoryDescription">Descripción</label>
                        <textarea id="categoryDescription" value={formData.description} onChange={(e) => handleInputChange('description', e.target.value)}
                            placeholder="Describe brevemente esta categoría" rows="3" disabled={loading} className="form-textarea"/>
                    </div>
                    
                    <div className="form-actions">
                        <button type="submit" className="btn-save" disabled={loading || !formData.name.trim()}>
                            {loading 
                                ? 'Guardando...' 
                                : (formData.isEditing ? 'Actualizar' : 'Crear Categoría')}
                        </button>
                        
                        {formData.isEditing && (
                            <button type="button" className="btn-cancel" onClick={cancelEdit} disabled={loading}>Cancelar</button>
                        )}
                    </div>
                </form>
            </div>

            <div className="categories-list-container">
                <div className="list-header">
                    <div className="header-left">
                        <h3> Categorías Existentes 
                            <span className="categories-count">
                                ({filteredAndSortedCategories.length} de {categories.length})
                            </span>
                        </h3>
                        
                        {searchTerm && (
                            <div className="search-info">
                                <span>Buscando: "{searchTerm}"</span>
                                <button onClick={clearSearch} className="btn-clear-search"title="Limpiar búsqueda"><img src="/close.png" alt="X" /></button>
                            </div>
                        )}
                    </div>
                    <div className="header-right">
                        <button onClick={fetchCategories} className="btn-refresh" disabled={loading}>{loading ? 'Cargando...' : 'Actualizar'}</button>
                    </div>
                </div>

                <div className="search-filter-bar">
                    <div className="search-box">
                        <div className="search-icon"><img src="/search.png" alt="Buscar" /></div>
                        <input type="text" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Buscar categorías por nombre o descripción..." className="search-input"disabled={loading}/>
                        {searchTerm && (
                            <button onClick={clearSearch} className="btn-clear" title="Limpiar búsqueda"><img src="/close.png" alt="Limpiar" /></button>
                        )}
                    </div>
                    <div className="filter-controls">
                        <label htmlFor="sortSelect">Ordenar por:</label>
                        <select id="sortSelect" value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="sort-select" disabled={loading}>
                            <option value="name">Nombre (A-Z)</option>
                            <option value="posts">Más populares (posts)</option>
                            <option value="newest">Más recientes</option>
                            <option value="oldest">Más antiguas</option>
                        </select>
                    </div>
                </div>
                {searchTerm && (
                    <div className="search-stats">
                        <p>
                            Encontradas <strong>{filteredAndSortedCategories.length}</strong> categorías 
                            de <strong>{categories.length}</strong> totales
                            {filteredAndSortedCategories.length === 0 && ' - No hay resultados'}
                        </p>
                    </div>
                )}
                
                {loading && categories.length === 0 ? (
                    <p className="loading-text">Cargando categorías...</p>
                ) : filteredAndSortedCategories.length === 0 ? (
                    <div className={`no-categories ${searchTerm ? 'no-results' : ''}`}>
                        {searchTerm ? (
                            <>
                                <p>No se encontraron categorías</p>
                                <p className="subtext">
                                    No hay resultados para "<strong>{searchTerm}</strong>". 
                                    Intenta con otros términos o <button onClick={clearSearch}className="btn-clear-text">limpia la búsqueda</button>.
                                </p>
                            </>
                        ) : (
                            <>
                                <p>No hay categorías creadas</p>
                                <p className="subtext">Crea tu primera categoría usando el formulario arriba.</p>
                            </>
                        )}
                    </div>
                ) : (
                    <>
                        <div className="categories-grid">
                            {filteredAndSortedCategories.map((category) => (
                                <div key={`category-${category.id}`} className="category-card">
                                    <div className="category-header">
                                        <h4 className="category-name">{category.name}</h4>
                                        <span className={`posts-count ${category.posts_count > 0 ? 'has-posts' : 'no-posts'}`}>
                                            {category.posts_count} {category.posts_count === 1 ? 'post' : 'posts'}
                                        </span>
                                    </div>
                                    
                                    {category.description && (
                                        <p className="category-description">
                                            {category.description}
                                        </p>
                                    )}
                                    
                                    <div className="category-meta">
                                        <span className="category-id">ID: {category.id}</span>
                                        <span className="category-date">
                                            Creada: {new Date(category.created_at).toLocaleDateString('es-ES', {
                                                year: 'numeric',
                                                month: 'short',
                                                day: 'numeric'
                                            })}
                                        </span>
                                    </div>
                                    
                                    <div className="category-actions">
                                        <button onClick={() => startEditCategory(category)} className="btn-edit" disabled={loading}> <img src="/edit.png" alt="" /> Editar</button>
                                        
                                        <button onClick={() => handleDeleteCategory(category.id)} className="btn-delete" disabled={loading || category.posts_count > 0}
                                            title={category.posts_count > 0 
                                                ? 'No se puede eliminar categorías con posts' 
                                                : 'Eliminar categoría'}>
                                            <img src="/delete.png" alt="" /> Eliminar
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="categories-list-mobile">
                            {filteredAndSortedCategories.map((category) => (
                                <div key={`category-mobile-${category.id}`} className="category-item-mobile">
                                    <div className="mobile-header">
                                        <h4>{category.name}</h4>
                                        <span className="mobile-posts">{category.posts_count} posts</span>
                                    </div>
                                    <div className="mobile-actions">
                                        <button onClick={() => startEditCategory(category)} className="btn-edit-mobile">Editar</button>
                                        <button onClick={() => handleDeleteCategory(category.id)} className="btn-delete-mobile" disabled={category.posts_count > 0}>Eliminar</button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </>
                )}
            </div>
        </div>
    )
}

export default CategoryManager