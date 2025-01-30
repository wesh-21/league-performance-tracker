import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.jsx';
import Login from './components/Login/Login';
import Register from './components/Register/Register';
import LeaguePerformanceTracker from './components/LeaguePerformanceTracker/LeaguePerformanceTracker';

const Main = () => {
  const [authToken, setAuthToken] = useState(localStorage.getItem('authToken'));
  const [username, setUsername] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);

  if (!authToken) {
    return (
      <div>
        {isRegistering ? (
          <Register setAuthToken={setAuthToken} />
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