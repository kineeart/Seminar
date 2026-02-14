import { useState } from 'react';
import './CreatePostModal.css';

export default function CreatePostModal({ isOpen, onClose, onSubmit, currentUsername }) {
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim() || !currentUsername) return;

    setIsSubmitting(true);
    try {
      await onSubmit(currentUsername, content.trim());
      setContent('');
      onClose();
    } catch (error) {
      console.error('Error creating post:', error);
      alert('Failed to create post. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setContent('');
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="modal-prompt">How do you feel today?</div>
            <textarea
              id="post-content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder=""
              rows={8}
              maxLength={2000}
              required
              className="modal-textarea"
            />
          </div>
          <div className="modal-footer">
            <button type="submit" disabled={!content.trim() || isSubmitting} className="modal-submit">
              {isSubmitting ? 'Submitting...' : 'Submit'}
            </button>
            <button type="button" onClick={handleClose} disabled={isSubmitting} className="modal-cancel">
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
