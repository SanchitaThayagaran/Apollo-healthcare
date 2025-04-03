// src/components/Header.js
import React from 'react';
import { Link, NavLink } from 'react-router-dom';
import './header.css'; // This points to your existing styles

function Header() {
  return (
    <header className="header">
      <Link to="/" className="apollo-brand">
        <img src="/logo.png" alt="Apollo Logo" className="apollo-logo" />
      </Link>

      <nav>
        <NavLink to="/" className={({ isActive }) => isActive ? "active" : ""}>HOME</NavLink>
        <NavLink to="/medications" className={({ isActive }) => isActive ? "active" : ""}>MEDICATIONS</NavLink>
        <NavLink to="/appointments" className={({ isActive }) => isActive ? "active" : ""}>APPOINTMENTS</NavLink>
        <NavLink to="/profile" className={({ isActive }) => isActive ? "active" : ""}>PROFILE</NavLink>
      </nav>

      <button className="assessment-button">TAKE ASSESSMENT</button>
    </header>
  );
}

export default Header;
