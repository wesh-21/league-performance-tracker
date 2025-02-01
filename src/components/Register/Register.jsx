import React, { useState } from 'react';
import axios from 'axios';
import styles from './Register.module.css';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "https://league-performance-tracker.onrender.com";

const Register = ({ setAuthToken }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleRegister = async () => {
    if (!username || !password) {
      setError('Please enter a username and password.');
      return;
    }

    try {
      const response = await axios.post(`${BACKEND_URL}/register`, { username, password });

      setSuccess(response.data.message);
      setError('');
      
      // Auto-login after successful registration
      if (response.data.token) {
        setAuthToken(response.data.token);
        localStorage.setItem('authToken', response.data.token);
      }
    } catch (error) {
      setError(error.response?.data?.message || 'Registration failed. Please try again.');
      setSuccess('');
    }
  };

  return (
    <div className={styles['register-container']}>
      <h2>Register</h2>
      {error && <p className="error-message">{error}</p>}
      {success && <p className="success-message">{success}</p>}
      <input
        type="text"
        placeholder="Username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <button onClick={handleRegister}>Register</button>
    </div>
  );
};

export default Register;
