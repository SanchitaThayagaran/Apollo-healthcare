// src/components/Header.js
import React from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import './header.css';

function Header() {
  const navigate = useNavigate();
  const role = localStorage.getItem('role'); // 'doctor' or 'patient'

  return (
    <header className="header">
      <Link to="/" className="apollo-brand">
        <img src="/logo.png" alt="Apollo Logo" className="apollo-logo" />
      </Link>

      <nav>
        <NavLink to="/" className={({ isActive }) => isActive ? "active" : ""}>HOME</NavLink>

        {role === 'doctor' && (
          <NavLink to="/medications" className={({ isActive }) => isActive ? "active" : ""}>
            MEDICATIONS
          </NavLink>
        )}

        {role === 'patient' && (
          <NavLink to="/appointments" className={({ isActive }) => isActive ? "active" : ""}>
            APPOINTMENTS
          </NavLink>
          
        )}
{role === 'patient' && (
          <NavLink to="/filterappointment" className={({ isActive }) => isActive ? "active" : ""}>
            VIEW
          </NavLink>
          
        )}
        <NavLink to="/profile" className={({ isActive }) => isActive ? "active" : ""}>PROFILE</NavLink>
      </nav>

      <button className="assessment-button" onClick={() => navigate('/assessment-entry')}>
        TAKE ASSESSMENT
      </button>
      <button className="logout-button" onClick={() => {
  localStorage.clear();
  navigate('/login');
}}>
  LOGOUT
</button>
    </header>
  );
}

export default Header;
