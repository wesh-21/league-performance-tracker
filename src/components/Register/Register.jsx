import React, { useState } from 'react';
import axios from 'axios';
import styles from './Register.module.css';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "https://league-performance-tracker.onrender.com";

const Register = ({ setAuthToken, setUsername }) => {
  const [usernameInput, setUsernameInput] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');

  const handleRegister = async () => {
    if (!usernameInput || !password) {
      setError('Please enter both a username and a password.');
      return;
    }
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      const response = await axios.post(`${BACKEND_URL}/api/auth/register`, { username: usernameInput, password });
      setSuccess(response.data.message);
      
      if (!response.data.token) {
        throw new Error('No token received');
      }
      
      // Use sessionStorage for consistency with Main component
      sessionStorage.setItem('authToken', response.data.token);
      sessionStorage.setItem('username', usernameInput);
      
      setAuthToken(response.data.token);
      setUsername(usernameInput);
      
      setUsernameInput('');
      setPassword('');
    } catch (error) {
      console.log('Error registering:', error);
      setError(error.response?.data?.message || 'Registration failed. Please try again.');
      setSuccess('');
    } finally {
      setLoading(false);
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
        value={usernameInput}  // Changed from username to usernameInput
        onChange={(e) => setUsernameInput(e.target.value)}
        disabled={loading}
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        disabled={loading}
      />
      <button onClick={handleRegister} disabled={loading}>
        {loading ? 'Registering...' : 'Register'}
      </button>
    </div>
  );
};

export default Register;