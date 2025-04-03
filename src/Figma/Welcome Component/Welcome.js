import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import './Welcome.css';
import '../header'


function WelcomePage() {
  const navigate = useNavigate();

  return (
    <div className="welcome">
      {/* Navbar */}
      <header className="header">
      <Link to="/" className="apollo-brand">
        <img src="/logo.png" alt="Apollo Logo" className="apollo-logo" />
        </Link>
        <button onClick={() => navigate('/login')} className="login-btn">
          LOGIN / REGISTER
        </button>
      </header>

      {/* Hero */}
      <section className="hero">
        <div className="hero-text">
          <h1>Welcome to Apollo Healthcare</h1>
          <p>
            At Apollo Healthcare, we believe in simplifying healthcare management through technology.
            Our platform is designed to bring healthcare to your fingertips, enabling smooth interactions
            between patients and healthcare providers...
          </p>
          <button className="learn-more">LEARN MORE</button>
        </div>
      </section>

      {/* Specialties */}
      <section className="specialists">
      <div className="specialist-cards">
  <div className="specialist-card">
    <img src="Pediatrician.png" alt="Pediatrician" />
    <p>For your health</p>
    <h3>Pediatrician</h3>
  </div>
  <div className="specialist-card">
    <img src="Cardiologist.jpg" alt="Cardiologist" />
    <p>For your health</p>
    <h3>Cardiologist</h3>
  </div>
  <div className="specialist-card">
    <img src="Dermatologist.jpg" alt="Dermatologist" />
    <p>For your health</p>
    <h3>Dermatologist</h3>
  </div>
</div>
      </section>

      {/* Appointment CTA */}
      <section className="appointment">
  <button 
    className="book-btn" 
    onClick={() => navigate('/appointments')}
  >
    BOOK APPOINTMENT
  </button>
  <h2>Get in touch to book your first appointment</h2>
  <p>📞 (123) 456-7890</p>
  <p>📧 apollo@healthcare</p>
</section>


      {/* Footer */}
      <footer className="welcome-footer">
        <div>APOLLO HEALTHCARE</div>
        <div>
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

export default WelcomePage;
