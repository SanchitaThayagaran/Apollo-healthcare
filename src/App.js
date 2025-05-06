import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';

import WelcomePage from './Figma/Welcome Component/Welcome';
import LoginPage from './Figma/Login Component/LoginFigma';
import AppointmentPage from './Figma/Appointment Component/Appointment'; 
import MedicationsPage from './Figma/Medications Component/Medication';

function App() {
  return (
    <GoogleOAuthProvider clientId="900988189639-7skbctltl07q5g29st5ao9u5i9lemq4r.apps.googleusercontent.com">
      <Router>
        <Routes>
          <Route path="/" element={<WelcomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/appointments" element={<AppointmentPage />} />
          <Route path="/medications" element={<MedicationsPage />} />
        </Routes>
      </Router>
    </GoogleOAuthProvider>
  );
}

export default App;
