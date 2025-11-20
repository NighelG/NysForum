import React from 'react'

const ReplyComment = ({ 
    reply, 
    parentId, 
    onLike, 
    onDislike, 
    currentUser, 
    replyingTo, 
    replyContents, 
    onStartReply, 
    onCancelReply, 
    onReplyContentChange, 
    onReply 
}) => {
    const isReplying = replyingTo === `${parentId}-${reply.id}`
    const replyContent = replyContents[parentId]?.[reply.id] || ''
    const getReplyUsername = () => {
        if (reply.profile?.user?.username) return reply.profile.user.username
        if (reply.username) return reply.username
        if (reply.profile?.username) return reply.profile.username
        return 'Usuario'
    }
    const getReplyAvatar = () => {
        return reply.profile?.avatar || "/defaultPFP.jpg"
    }

return (
    <div className="reply-item">
    <div className="comment-header">
        <img src={getReplyAvatar()} alt="Avatar" className="comment-avatar" />
        <div className="comment-user-info">
        <span className="comment-username">{getReplyUsername()}</span>
        <span className="comment-date">{new Date(reply.created_at).toLocaleString()}</span>
        </div>
    </div>
    <div className="comment-content">
        <p>{reply.content}</p>
    </div>
    <div className="comment-actions">
        <button className={`like-btn ${reply.user_reaction === 'like' ? 'active' : ''}`}onClick={() => onLike(reply.id)}disabled={!currentUser || currentUser.isGuest}>
            <img src="/like.png" alt="Like" className="reaction-icon" />
            {reply.likes_count || 0}
        </button>
        <button className={`dislike-btn ${reply.user_reaction === 'dislike' ? 'active' : ''}`}onClick={() => onDislike(reply.id)}disabled={!currentUser || currentUser.isGuest}>
            <img src="/dislike.png" alt="Dislike" className="reaction-icon" />
            {reply.dislikes_count || 0}
        </button>
        <button className="reply-btn"onClick={() => onStartReply(reply.id, parentId)}disabled={!currentUser || currentUser.isGuest}>
            Responder
        </button>
    </div>
    {isReplying && (
        <div className="reply-form">
            <textarea value={replyContent} onChange={(e) => onReplyContentChange(e.target.value, reply.id, parentId)}
                placeholder="Escribe tu respuesta..."className="reply-textarea"rows="3"/>
            <div className="reply-form-actions">
                <button type="button" className="btn-cancel" onClick={onCancelReply}>Cancelar</button>
                <button type="button"onClick={() => onReply(reply.id, parentId)} disabled={!replyContent.trim()}className="btn-submit">
                    Responder
                </button>
            </div>
        </div>
    )}
    </div>
)
}

export default React.memo(ReplyComment)