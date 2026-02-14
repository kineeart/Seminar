import { useState } from 'react';
import { formatDate } from '../utils/formatDate';
import './PostCard.css';

export default function PostCard({ post, currentUsername, onLike, onComment, onViewDetails }) {
  const [isLiked, setIsLiked] = useState(false);

  const handleLike = async (e) => {
    e.stopPropagation();
    if (!currentUsername) return;
    
    try {
      if (isLiked) {
        await onLike(post.id, false);
        setIsLiked(false);
      } else {
        await onLike(post.id, true);
        setIsLiked(true);
      }
    } catch (error) {
      console.error('Error liking post:', error);
    }
  };

  const handleComment = (e) => {
    e.stopPropagation();
    onComment(post.id);
  };

  const handleCardClick = () => {
    onViewDetails(post.id);
  };

  return (
    <div className="post-card" onClick={handleCardClick}>
      <div className="post-card-header">
        <div className="post-avatar">
          <span>{post.username.charAt(0).toUpperCase()}</span>
        </div>
        <div className="post-info">
          <div className="post-username">{post.username}</div>
          <div className="post-time">{formatDate(post.createdAt)}</div>
        </div>
      </div>
      <div className="post-content">{post.content}</div>
      <div className="post-actions">
        <button 
          className={`post-action-button ${isLiked ? 'liked' : ''}`}
          onClick={handleLike}
          disabled={!currentUsername}
          aria-label="Like"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill={isLiked ? "currentColor" : "none"} xmlns="http://www.w3.org/2000/svg">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <span>{post.likesCount || 0}</span>
        </button>
        <button 
          className="post-action-button"
          onClick={handleComment}
          disabled={!currentUsername}
          aria-label="Comment"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <span>{post.commentsCount || 0}</span>
        </button>
      </div>
    </div>
  );
}
