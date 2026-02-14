import { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import SearchBar from '../components/SearchBar';
import PostCard from '../components/PostCard';
import { postsAPI } from '../services/api';
import './SearchPage.css';

export default function SearchPage({ currentUsername, onNavigate, onPostClick, onCommentClick, onLikePost }) {
  const [posts, setPosts] = useState([]);
  const [filteredPosts, setFilteredPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchPosts();
  }, []);

  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredPosts(posts);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = posts.filter(post => 
      post.content.toLowerCase().includes(query) ||
      post.username.toLowerCase().includes(query)
    );
    setFilteredPosts(filtered);
  }, [searchQuery, posts]);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await postsAPI.getAll();
      setPosts(data || []);
      setFilteredPosts(data || []);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching posts:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (query) => {
    setSearchQuery(query);
  };

  const handleLike = async (postId, isLiking) => {
    if (!currentUsername) return;
    
    try {
      if (isLiking) {
        await onLikePost(postId, currentUsername, true);
      } else {
        await onLikePost(postId, currentUsername, false);
      }
      await fetchPosts();
    } catch (err) {
      console.error('Error liking post:', err);
    }
  };

  return (
    <div className="search-page">
      <Sidebar activePage="search" onNavigate={onNavigate} />
      <div className="search-content">
        <div className="search-container">
          <SearchBar onSearch={handleSearch} />
          
          {loading ? (
            <div className="search-loading">
              <div className="loading-spinner"></div>
              <p>Loading posts...</p>
            </div>
          ) : error ? (
            <div className="search-error">
              <p>Error loading posts: {error}</p>
              <button onClick={fetchPosts}>Retry</button>
            </div>
          ) : filteredPosts.length === 0 ? (
            <div className="search-empty">
              <p>{searchQuery ? 'No posts found matching your search.' : 'No posts yet.'}</p>
            </div>
          ) : (
            <div className="search-results">
              {filteredPosts.map((post) => (
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
          )}
        </div>
      </div>
    </div>
  );
}
