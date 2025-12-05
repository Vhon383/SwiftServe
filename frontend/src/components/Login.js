import React, { useState } from 'react';
import axios from 'axios';

const Login = ({ setUser }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [isRegister, setIsRegister] = useState(false);
  const [message, setMessage] = useState('');
  const [isError, setIsError] = useState(false);
  const [loading, setLoading] = useState(false);

  const validateForm = () => {
    if (!email || !password || (isRegister && !fullName)) {
      setMessage('Please fill in all fields');
      setIsError(true);
      return false;
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      setMessage('Please enter a valid email');
      setIsError(true);
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setLoading(true);

    const endpoint = isRegister ? '/register' : '/login';
    const payload = isRegister ? { email, password, fullName } : { email, password };

    try {
      const res = await axios.post(`http://localhost:3001${endpoint}`, payload);
      if (res.data.user) {
        setUser(res.data.user);
        setMessage('');
      } else {
        setMessage(res.data.message);
        setIsError(false);
      }
    } catch (error) {
      setMessage(error.response?.data?.error || 'An error occurred');
      setIsError(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2>{isRegister ? 'Register' : 'Login'}</h2>

      <form onSubmit={handleSubmit}>

        {/* Email */}
        <div className="form-group">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            aria-label="Email"
          />
        </div>

        {/* Password */}
        <div className="form-group">
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            aria-label="Password"
          />
        </div>

        {/* Full Name for Register */}
        {isRegister && (
          <div className="form-group">
            <input
              type="text"
              placeholder="👤 Full Name"
              value={fullName}
              onChange={e => setFullName(e.target.value)}
              required
              aria-label="Full Name"
            />
          </div>
        )}

        {/* Message */}
        {message && (
          <p style={{ color: isError ? 'red' : 'green' }}>
            {message}
          </p>
        )}

        {/* Submit Button */}
        <button type="submit" disabled={loading}>
          {loading ? 'Please wait...' : isRegister ? 'Register' : 'Login'}
        </button>
      </form>

      {/* Toggle Login/Register */}
      <button onClick={() => setIsRegister(!isRegister)}>
        {isRegister ? 'Already have an account? Login' : 'Create an account'}
      </button>

    </div>
  );
};

export default Login;
