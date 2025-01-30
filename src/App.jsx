import React, { useState } from 'react';
import Login from './components/Login/Login';
import Register from './components/Register/Register';

const App = () => {
  const [authToken, setAuthToken] = useState(null);

  if (!authToken) {
    return (
      <div>
        <Login setAuthToken={setAuthToken} />
        <Register />
      </div>
    );
  }

  return <div>Welcome to League Performance Tracker</div>;
};

export default App;
