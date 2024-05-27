// Login.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './login.css'; // Ensure this path is correct

const authURL = 'http://localhost:3010/auth';

const login = async (email, password) => { 
    try {
        const response = await axios.post(`${authURL}/login`, { email, password });
        return response.data.token;
    } catch (error) {
        console.error('Neuspešno pridobivanje tokena', error);
        return null;
    }
};

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    document.body.style.backgroundColor = '#FED467';
    document.body.style.fontFamily = "'Montserrat', sans-serif";
    console.log('Added inline styles to body');
    return () => {
      document.body.style.backgroundColor = '';
      document.body.style.fontFamily = '';
      console.log('Removed inline styles from body');
    };
  }, []);

  const handleFormSubmit = async (event) => {
    event.preventDefault();
    const token = await login(email, password);
    if (token) {
      localStorage.setItem('token', token);
      localStorage.setItem('isAdmin', email === 'admin@gmail.com'); // Set admin flag
      console.log('Token accepted and stored:', token);
      if (email === 'admin@gmail.com') {
        navigate('/admin');
      } else {
        navigate('/');
      }
    } else {
      alert('Napačno uporabniško ime ali geslo. Poskusite znova.');
    }
  };

  return (
    <div className="login-container">
      <h2>Prijava</h2>
      <form id="login-form" onSubmit={handleFormSubmit}>
        <div className="form-group">
          <label htmlFor="email">E-naslov:</label>
          <input
            type="text"
            id="email"
            name="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div className="form-group">
          <label htmlFor="password">Geslo:</label>
          <input
            type="password"
            id="password"
            name="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        <div className="form-group">
          <button type="submit">Prijava</button>
        </div>
      </form>
      <p>Nimaš računa? <a href="/register">Registriraj se tukaj!</a></p>
    </div>
  );
};

export default Login;
