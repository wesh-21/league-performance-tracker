import React, { useState } from 'react';
import axios from 'axios';
import styles from './Login.module.css';

const Login = ({ setAuthToken, setUsername }) => {
  const [usernameInput, setUsernameInput] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async () => {
    if (!usernameInput || !password) {
      setError('Please enter both username and password.');
      return;
    }

    try {
      const response = await axios.post('http://localhost:5000/login', { username: usernameInput, password });

      setAuthToken(response.data.token);
      localStorage.setItem('authToken', response.data.token); // Store token persistently
      setUsername(usernameInput); // Update the username state in Main
    } catch (error) {
      setError(error.response?.data?.message || 'Login failed. Please try again.');
    }
  };

  return (
    <div className={ styles['login-container'] }>
      <h2>Login</h2>
      {error && <p className="error-message">{error}</p>}
      <input
        type="text"
        placeholder="Username"
        value={usernameInput}
        onChange={(e) => setUsernameInput(e.target.value)}
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <button onClick={handleLogin}>Login</button>
    </div>
  );
};

export default Login;
