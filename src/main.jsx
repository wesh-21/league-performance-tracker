import React, { useState, useEffect, createContext, useContext } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.jsx';
import Login from './components/Login/Login';
import Register from './components/Register/Register';
import LeaguePerformanceTracker from './components/LeaguePerformanceTracker/LeaguePerformanceTracker';

// Create a context for user data
const UserContext = createContext(null);

// Custom hook for accessing user data throughout the app
export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};

const Main = () => {
  const [authToken, setAuthToken] = useState(sessionStorage.getItem('authToken'));
  const [userData, setUserData] = useState({
    id: sessionStorage.getItem('userId'),
    username: sessionStorage.getItem('username') || '',
    // Add any other user-related fields you need
  });
  const [isRegistering, setIsRegistering] = useState(false);

  const updateUser = (data) => {
    setUserData(data);
    // Store in sessionStorage
    Object.entries(data).forEach(([key, value]) => {
      sessionStorage.setItem(key, value);
    });
  };

  const clearUser = () => {
    setUserData({
      id: null,
      username: '',
    });
    setAuthToken(null);
    // Clear sessionStorage
    sessionStorage.clear();
  };

  // Effect to watch for authToken change and redirect if set
  useEffect(() => {
    if (authToken) {
      // Update user data from sessionStorage
      setUserData({
        id: sessionStorage.getItem('userId'),
        username: sessionStorage.getItem('username'),
      });
      console.log('User logged in:', userData);
    }
  }, [authToken]);

  const userContextValue = {
    ...userData,
    authToken,
    updateUser,
    clearUser,
    setAuthToken,
  };

  if (!authToken) {
    return (
      <UserContext.Provider value={userContextValue}>
        <div>
          {isRegistering ? (
            <Register
              setAuthToken={setAuthToken}
              updateUser={updateUser}
            />
          ) : (
            <Login 
              setAuthToken={setAuthToken}
              updateUser={updateUser}
            />
          )}
          <button onClick={() => setIsRegistering(!isRegistering)}>
            {isRegistering ? 'Already have an account? Login' : "Don't have an account? Register"}
          </button>
        </div>
      </UserContext.Provider>
    );
  }

  return (
    <UserContext.Provider value={userContextValue}>
      <LeaguePerformanceTracker />
    </UserContext.Provider>
  );
};

createRoot(document.getElementById('root')).render(<Main />);