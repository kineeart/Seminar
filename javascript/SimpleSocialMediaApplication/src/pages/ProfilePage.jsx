import Sidebar from '../components/Sidebar';
import './ProfilePage.css';

export default function ProfilePage({ currentUsername, onNavigate }) {
  return (
    <div className="profile-page">
      <Sidebar activePage="profile" onNavigate={onNavigate} />
      <div className="profile-content">
        <div className="profile-container">
          <h1>Profile</h1>
          {currentUsername ? (
            <div className="profile-info">
              <p>Username: <strong>{currentUsername}</strong></p>
              <p>This is a simple profile page. More features coming soon!</p>
            </div>
          ) : (
            <p>Please enter your name to view your profile.</p>
          )}
        </div>
      </div>
    </div>
  );
}
