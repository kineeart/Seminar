import { useState } from 'react';
import PostFeed from '../components/PostFeed';
import Sidebar from '../components/Sidebar';
import CreatePostModal from '../components/CreatePostModal';
import './HomePage.css';

export default function HomePage({ currentUsername, onNavigate, onCreatePost, onLikePost, onPostClick, onCommentClick }) {
  const [showCreateModal, setShowCreateModal] = useState(false);

  const handleCreatePost = async (username, content) => {
    await onCreatePost(username, content);
    setShowCreateModal(false);
  };

  return (
    <div className="home-page">
      <Sidebar activePage="home" onNavigate={onNavigate} />
      <div className="home-content">
        <PostFeed
          currentUsername={currentUsername}
          onPostClick={onPostClick}
          onCommentClick={onCommentClick}
          onLikePost={onLikePost}
        />
      </div>
      <div className="home-sidebar-right">
        <button 
          className="create-post-button"
          onClick={() => setShowCreateModal(true)}
          aria-label="Create new post"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 5V19M5 12H19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      </div>
      <CreatePostModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSubmit={handleCreatePost}
        currentUsername={currentUsername}
      />
    </div>
  );
}
