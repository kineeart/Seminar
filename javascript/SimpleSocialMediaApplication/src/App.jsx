import { useState, useEffect } from 'react';
import BackendStatus from './components/BackendStatus';
import NameInputModal from './components/NameInputModal';
import PostDetails from './components/PostDetails';
import HomePage from './pages/HomePage';
import SearchPage from './pages/SearchPage';
import ProfilePage from './pages/ProfilePage';
import { postsAPI, likesAPI } from './services/api';
import './App.css';

function App() {
  const [currentUsername, setCurrentUsername] = useState(() => {
    return localStorage.getItem('username') || null;
  });
  const [currentPage, setCurrentPage] = useState('home');
  const [selectedPostId, setSelectedPostId] = useState(null);
  const [showNameModal, setShowNameModal] = useState(!currentUsername);

  useEffect(() => {
    if (currentUsername) {
      localStorage.setItem('username', currentUsername);
    }
  }, [currentUsername]);

  const handleNameSubmit = (username) => {
    setCurrentUsername(username);
    setShowNameModal(false);
  };

  const handleNavigate = (page) => {
    setCurrentPage(page);
    setSelectedPostId(null);
  };

  const handlePostClick = (postId) => {
    setSelectedPostId(postId);
  };

  const handlePostDetailsClose = () => {
    setSelectedPostId(null);
  };

  const handleCreatePost = async (username, content) => {
    try {
      await postsAPI.create(username, content);
      // PostFeed will automatically refresh
    } catch (error) {
      console.error('Error creating post:', error);
      throw error;
    }
  };

  const handleLikePost = async (postId, username, isLiking) => {
    try {
      if (isLiking) {
        await likesAPI.like(postId, username);
      } else {
        await likesAPI.unlike(postId);
      }
    } catch (error) {
      console.error('Error liking post:', error);
      throw error;
    }
  };

  const handleCommentClick = (postId) => {
    setSelectedPostId(postId);
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'home':
        return (
          <HomePage
            currentUsername={currentUsername}
            onNavigate={handleNavigate}
            onCreatePost={handleCreatePost}
            onLikePost={handleLikePost}
            onPostClick={handlePostClick}
            onCommentClick={handleCommentClick}
          />
        );
      case 'search':
        return (
          <SearchPage
            currentUsername={currentUsername}
            onNavigate={handleNavigate}
            onPostClick={handlePostClick}
            onCommentClick={handleCommentClick}
            onLikePost={handleLikePost}
          />
        );
      case 'profile':
        return (
          <ProfilePage
            currentUsername={currentUsername}
            onNavigate={handleNavigate}
          />
        );
      default:
        return (
          <HomePage
            currentUsername={currentUsername}
            onNavigate={handleNavigate}
            onCreatePost={handleCreatePost}
            onLikePost={handleLikePost}
            onPostClick={handlePostClick}
            onCommentClick={handleCommentClick}
          />
        );
    }
  };

  return (
    <div className="app">
      <BackendStatus />
      <NameInputModal
        isOpen={showNameModal}
        onClose={() => {
          if (currentUsername) {
            setShowNameModal(false);
          }
        }}
        onSubmit={handleNameSubmit}
      />
      {selectedPostId && (
        <PostDetails
          postId={selectedPostId}
          currentUsername={currentUsername}
          onClose={handlePostDetailsClose}
        />
      )}
      {renderPage()}
    </div>
  );
}

export default App;
