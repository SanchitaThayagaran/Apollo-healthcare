import { Link } from 'react-router-dom';
import React from 'react';
import './LoginFigma.css';
import '../header.css'; // Adjust path if needed
import Header from '../header';

function LoginPage() {
  return (
    
    <div className="page-container">
      {/* NAVBAR */}
      
      <Header />

      {/* LOGIN BOX */}
      <main className="login-wrapper">
        <h1>LOGIN</h1>
        <p className="greeting">Welcome! Glad to see you.</p>
        <form className="login-form">
          <input type="text" placeholder="USERNAME" />
          <input type="email" placeholder="EMAIL" />
          <input type="password" placeholder="PASSWORD" />
          <input type="password" placeholder="CONFIRM PASSWORD" />
          <button type="submit" className="register-button">Agree and Register</button>
        </form>
        <div className="or-divider">
          <span>Or login with</span>
        </div>
        <div className="google-signin">
          <button className="google-btn">
            <img src="google.png" alt="Google Login" />
          </button>
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
