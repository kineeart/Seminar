import { useState, useEffect } from 'react';
import { postsAPI, commentsAPI, likesAPI } from '../services/api';
import { formatDate } from '../utils/formatDate';
import './PostDetails.css';

export default function PostDetails({ postId, currentUsername, onClose, onCommentSubmit }) {
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isLiked, setIsLiked] = useState(false);
  const [commentContent, setCommentContent] = useState('');

  useEffect(() => {
    fetchPostDetails();
    fetchComments();
  }, [postId]);

  const fetchPostDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await postsAPI.getById(postId);
      setPost(data);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching post:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchComments = async () => {
    try {
      const data = await commentsAPI.getByPostId(postId);
      setComments(data || []);
    } catch (err) {
      console.error('Error fetching comments:', err);
    }
  };

  const handleLike = async () => {
    if (!currentUsername) return;
    
    try {
      if (isLiked) {
        await likesAPI.unlike(postId);
        setIsLiked(false);
      } else {
        await likesAPI.like(postId, currentUsername);
        setIsLiked(true);
      }
      await fetchPostDetails();
    } catch (err) {
      console.error('Error liking post:', err);
    }
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!commentContent.trim() || !currentUsername) return;

    try {
      await commentsAPI.create(postId, currentUsername, commentContent.trim());
      setCommentContent('');
      await fetchComments();
      await fetchPostDetails();
      if (onCommentSubmit) {
        onCommentSubmit();
      }
    } catch (err) {
      console.error('Error creating comment:', err);
      alert('Failed to create comment. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="post-details-loading">
        <div className="loading-spinner"></div>
        <p>Loading post...</p>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="post-details-error">
        <p>Error loading post: {error || 'Post not found'}</p>
        <button onClick={onClose}>Close</button>
      </div>
    );
  }

  return (
    <div className="post-details">
      <div className="post-details-header">
        <button className="post-details-close" onClick={onClose} aria-label="Close">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      </div>

      <div className="post-details-content">
        <div className="post-details-card">
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
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill={isLiked ? "currentColor" : "none"} xmlns="http://www.w3.org/2000/svg">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <span>{post.likesCount || 0}</span>
            </button>
            <button className="post-action-button" disabled>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <span>{post.commentsCount || 0}</span>
            </button>
          </div>
        </div>

        <div className="post-details-comments">
          <h3>Comments ({comments.length})</h3>
          
          {currentUsername && (
            <form className="comment-form" onSubmit={handleCommentSubmit}>
              <textarea
                value={commentContent}
                onChange={(e) => setCommentContent(e.target.value)}
                placeholder="Write a comment..."
                rows={3}
                maxLength={1000}
                required
              />
              <button type="submit">Post Comment</button>
            </form>
          )}

          <div className="comments-list">
            {comments.length === 0 ? (
              <p className="no-comments">No comments yet. Be the first to comment!</p>
            ) : (
              comments.map((comment) => (
                <div key={comment.id} className="comment-item">
                  <div className="comment-header">
                    <div className="comment-avatar">
                      <span>{comment.username.charAt(0).toUpperCase()}</span>
                    </div>
                    <div className="comment-info">
                      <div className="comment-username">{comment.username}</div>
                      <div className="comment-time">{formatDate(comment.createdAt)}</div>
                    </div>
                  </div>
                  <div className="comment-content">{comment.content}</div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
