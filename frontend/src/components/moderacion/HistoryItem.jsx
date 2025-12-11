import React, { useMemo } from 'react'
import { getActionLabel, getTimeAgo } from '../../utils/moderationUtils'

function HistoryItem({ action }) {
    const isPost = action._type === 'post'
    const actionDate = useMemo(() => new Date(action.created_at), [action.created_at])
    const timeAgo = useMemo(() => getTimeAgo(actionDate), [actionDate])

  return (
    <div className="history-item">
        <div className="history-header">
            <span className={`action-type ${isPost ? 'post ' : 'comment '}`}>
                {isPost ? 'Post ' : 'Comentario '}
            </span>
            <span className="moderator">{action.moderator_username}</span>
            <span className={`action ${action.action}`}>
            {getActionLabel(action.action)}
            </span>
            <span className="date" title={actionDate.toLocaleString()}>
                {timeAgo}
            </span>
        </div>
        <div className="history-content">
            <p><strong>Contenido:</strong> {
                isPost 
                    ? `"${action.post_title}" por ${action.post_author}`
                    : `"${action.comment_content?.substring(0, 100)}..." por ${action.comment_author}`
                }</p>
                {action.reason && (
                <p><strong>Razón:</strong> {action.reason}</p>
            )}
        </div>
    </div>
  )
}

export default React.memo(HistoryItem)