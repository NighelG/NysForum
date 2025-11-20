import React from 'react'
import ReplyComment from './ReplyComment'

const CommentSection = ({ 
    comment, 
    onLike, 
    onDislike, 
    currentUser, 
    replyingTo, 
    replyContents,
    expandedReplies,
    onStartReply, 
    onCancelReply, 
    onReplyContentChange, 
    onReply, 
    onToggleReplies 
}) => {
    const isReplying = replyingTo === comment.id
    const replyContent = replyContents[comment.id] || ''
    const replies = comment.replies || []
    const showExpandButton = replies.length > 2
    const displayedReplies = expandedReplies[comment.id] ? replies : replies.slice(0, 2)
    const hiddenRepliesCount = replies.length - 2
    const getCommentUsername = () => {
        if (comment.profile?.user?.username) return comment.profile.user.username
        if (comment.username) return comment.username
        if (comment.profile?.username) return comment.profile.username
        return 'Usuario'
    }
    const getCommentAvatar = () => {
        return comment.profile?.avatar || "/defaultPFP.jpg"
    }

return (
    <div className="comment-item">
    <div className="comment-header">
        <img src={getCommentAvatar()} alt="Avatar" className="comment-avatar" />
        <div className="comment-user-info">
            <span className="comment-username">{getCommentUsername()}</span>
            <span className="comment-date">{new Date(comment.created_at).toLocaleString()}</span>
        </div>
    </div>
    <div className="comment-content">
        <p>{comment.content}</p>
    </div>
    <div className="comment-actions">
        <button className={`like-btn ${comment.user_reaction === 'like' ? 'active' : ''}`}
        onClick={() => onLike(comment.id)} disabled={!currentUser || currentUser.isGuest}>
            <img src="/like.png" alt="Like" className="reaction-icon" />
            {comment.likes_count}
        </button>
        <button className={`dislike-btn ${comment.user_reaction === 'dislike' ? 'active' : ''}`}
        onClick={() => onDislike(comment.id)} disabled={!currentUser || currentUser.isGuest}>
            <img src="/dislike.png" alt="Dislike" className="reaction-icon" />
            {comment.dislikes_count}
        </button>
        <button className="reply-btn" onClick={() => onStartReply(comment.id)} disabled={!currentUser || currentUser.isGuest}>
            Responder
        </button>
    </div>
    {isReplying && (
        <div className="reply-form">
            <textarea value={replyContent} onChange={(e) => onReplyContentChange(e.target.value, comment.id)}
                placeholder="Escribe tu respuesta..." className="reply-textarea" rows="3" />
            <div className="reply-form-actions">
                <button type="button" className="btn-cancel"onClick={onCancelReply}>Cancelar</button>
                <button type="button"onClick={() => onReply(comment.id)} disabled={!replyContent.trim()} className="btn-submit">Responder</button>
            </div>
        </div>
    )}
    {replies.length > 0 && (
        <div className="replies-container">
        {displayedReplies.map(reply => (
            <ReplyComment 
            key={reply.id} 
            reply={reply} 
            parentId={comment.id}
            onLike={onLike} 
            onDislike={onDislike} 
            currentUser={currentUser}
            replyingTo={replyingTo}
            replyContents={replyContents}
            onStartReply={onStartReply}
            onCancelReply={onCancelReply}
            onReplyContentChange={onReplyContentChange}
            onReply={onReply}
            />
        ))}
        {showExpandButton && !expandedReplies[comment.id] && (
            <button className="show-more-replies-btn" onClick={() => onToggleReplies(comment.id)}>Ver {hiddenRepliesCount}respuestas más</button>
        )}
        {expandedReplies[comment.id] && (
            <button className="reply-at-end-btn"onClick={() => onStartReply(comment.id)}disabled={!currentUser || currentUser.isGuest}>
                Responder
            </button>
        )}
        </div>
    )}
    </div>
)
}

export default React.memo(CommentSection)