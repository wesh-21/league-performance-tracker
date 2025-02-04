import React, { useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.jsx';
import Login from './components/Login/Login';
import Register from './components/Register/Register';
import LeaguePerformanceTracker from './components/LeaguePerformanceTracker/LeaguePerformanceTracker';

const Main = () => {
  const [authToken, setAuthToken] = useState(sessionStorage.getItem('authToken'));
  const [username, setUsername] = useState(sessionStorage.getItem('username') || '');
  const [isRegistering, setIsRegistering] = useState(false);

  // Effect to watch for authToken change and redirect if set
  useEffect(() => {
    if (authToken) {
      setUsername(sessionStorage.getItem('username')); // Ensure username is set after login/registration
    }
  }, [authToken]);

  if (!authToken) {
    return (
      <div>
        {isRegistering ? (
          <Register 
            setAuthToken={setAuthToken} 
            setUsername={setUsername} 
          />
        ) : (
          <Login setAuthToken={setAuthToken} setUsername={setUsername} />
        )}
        <button onClick={() => setIsRegistering(!isRegistering)}>
          {isRegistering ? 'Already have an account? Login' : "Don't have an account? Register"}
        </button>
      </div>
    );
  }

  return (
    <LeaguePerformanceTracker 
      loggedInUser={username} 
      setAuthToken={setAuthToken} 
      setUsername={setUsername}
    />
  );
};

createRoot(document.getElementById('root')).render(<Main />);
