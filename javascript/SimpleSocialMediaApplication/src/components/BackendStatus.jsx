import { useState, useEffect } from 'react';
import { checkBackendHealth } from '../services/api';
import './BackendStatus.css';

export default function BackendStatus() {
  const [isAvailable, setIsAvailable] = useState(true);
  const [isChecking, setIsChecking] = useState(false);

  useEffect(() => {
    const checkStatus = async () => {
      setIsChecking(true);
      const available = await checkBackendHealth();
      setIsAvailable(available);
      setIsChecking(false);
    };

    // Check immediately
    checkStatus();

    // Check every 5 seconds
    const interval = setInterval(checkStatus, 5000);

    return () => clearInterval(interval);
  }, []);

  if (isAvailable) {
    return null;
  }

  return (
    <div className="backend-status-error">
      <div className="backend-status-content">
        <span className="backend-status-icon">⚠️</span>
        <span className="backend-status-message">
          Backend API is not available. Please ensure the backend is running on http://localhost:8000
        </span>
      </div>
    </div>
  );
}
