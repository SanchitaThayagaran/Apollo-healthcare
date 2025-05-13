import { GoogleLogin } from '@react-oauth/google';
import React from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './LoginFigma.css';
import '../header.css'; // Adjust path if needed
import Header from '../header';

function LoginPage() {
  const navigate = useNavigate();

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      const token = credentialResponse.credential;

      // Send token to Django backend to verify and fetch role
      const response = await axios.post('http://localhost:8000/api/accounts/google-login/', {
        token: token,
      });

      // Save access/refresh tokens in localStorage
      localStorage.setItem('access', response.data.access);
      localStorage.setItem('refresh', response.data.refresh);
      localStorage.setItem('user_id', response.data.user_id);

      localStorage.setItem('role', response.data.role); // 'doctor' or 'patient'
      // Check user role and redirect to appropriate page
      if (response.data.role === 'patient') {
        navigate('/appointments'); 
      } else {
        navigate('/medications'); 
      }
    } catch (error) {
      console.error('Login failed:', error);
      alert('Google login failed. Please try again.');
    }
  };

  return (
    <div className="page-container">
      {/* NAVBAR */}
      <Header />

      {/* LOGIN BOX */}
      <main className="login-wrapper">
        <h1>LOGIN</h1>
        <p className="greeting">Welcome! Glad to see you.</p>

        <div className="or-divider">
          <span>Or login with</span>
        </div>

        {/* Google Login */}
        <div className="google-signin">
          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={() => {
              console.log('Google Login Failed');
              alert('Google login failed.');
            }}
            useOneTap
          />
        </div>
      </main>

      {/* FOOTER */}
      <footer className="footer">
        <div className="left">APOLLO HEALTHCARE</div>
        <div className="right">
          <p>SERVICES</p>
          <ul>
            <li>PATHOLOGY</li>
            <li>CARDIOLOGY</li>
            <li>PHARMACY</li>
          </ul>
        </div>
      </footer>
    </div>
  );
}

export default LoginPage;
