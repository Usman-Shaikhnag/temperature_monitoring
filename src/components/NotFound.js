import React from 'react';
import { useNavigate } from 'react-router-dom';
import './NotFound.css';

function NotFound() {
  const navigate = useNavigate();

  const handleGoHome = () => {
    navigate('/');
  };

  const handleGoBack = () => {
    navigate(-1);
  };

  return (
    <div className="not-found-container">
      <div className="not-found-content">
        <div className="error-animation">
          <div className="error-number">4</div>
          <div className="error-orb">0</div>
          <div className="error-number">4</div>
        </div>
        
        <h1 className="error-title">Page Not Found</h1>
        
        <p className="error-message">
          Oops! The page you're looking for seems to have wandered off into the digital void.
          It might have been moved, deleted, or you entered an incorrect URL.
        </p>

        <div className="error-actions">
          <button 
            className="btn btn-primary" 
            onClick={handleGoHome}
          >
            Go Home
          </button>
          <button 
            className="btn btn-secondary" 
            onClick={handleGoBack}
          >
            Go Back
          </button>
        </div>

        <div className="error-help">
          <p>Need help? Try these options:</p>
          <ul>
            <li>Check the URL for typos</li>
            <li>Visit our homepage</li>
            <li>Contact support</li>
          </ul>
        </div>
      </div>
      
      <div className="error-footer">
        <p>&copy; eSehat Meditech Ltd. All rights reserved.</p>
      </div>
    </div>
  );
}

export default NotFound;