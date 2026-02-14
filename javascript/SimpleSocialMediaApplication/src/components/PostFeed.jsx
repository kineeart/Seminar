import { useState, useEffect } from 'react';
import { postsAPI } from '../services/api';
import PostCard from './PostCard';
import './PostFeed.css';

export default function PostFeed({ currentUsername, onPostClick, onCommentClick, onLikePost }) {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await postsAPI.getAll();
      setPosts(data || []);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching posts:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
    // Refresh posts every 10 seconds
    const interval = setInterval(fetchPosts, 10000);
    return () => clearInterval(interval);
  }, []);

  const handleLike = async (postId, isLiking) => {
    if (!currentUsername) return;
    
    try {
      if (isLiking) {
        await onLikePost(postId, currentUsername, true);
      } else {
        await onLikePost(postId, currentUsername, false);
      }
      // Refresh posts after like
      await fetchPosts();
    } catch (err) {
      console.error('Error liking post:', err);
    }
  };

  if (loading) {
    return (
      <div className="post-feed-loading">
        <div className="loading-spinner"></div>
        <p>Loading posts...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="post-feed-error">
        <p>Error loading posts: {error}</p>
        <button onClick={fetchPosts}>Retry</button>
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <div className="post-feed-empty">
        <p>No posts yet. Be the first to share something!</p>
      </div>
    );
  }

  return (
    <div className="post-feed">
      {posts.map((post) => (
        <PostCard
          key={post.id}
          post={post}
          currentUsername={currentUsername}
          onLike={handleLike}
          onComment={onCommentClick}
          onViewDetails={onPostClick}
        />
      ))}
    </div>
  );
}
