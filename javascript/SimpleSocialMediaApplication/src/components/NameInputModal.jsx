import { useState } from 'react';
import './NameInputModal.css';

export default function NameInputModal({ isOpen, onClose, onSubmit }) {
  const [username, setUsername] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!username.trim()) return;
    onSubmit(username.trim());
    setUsername('');
    onClose();
  };

  const handleClose = () => {
    setUsername('');
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <h2 className="modal-title">Enter your username</h2>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="UserName"
              maxLength={50}
              required
              autoFocus
              className="modal-input"
            />
          </div>
          <div className="modal-footer">
            <button type="submit" disabled={!username.trim()} className="modal-ok-button">
              OK
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
