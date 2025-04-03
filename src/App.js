import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import WelcomePage from './Figma/Welcome Component/Welcome';
import LoginPage from './Figma/Login Component/LoginFigma';
import AppointmentPage from './Figma/Appointment Component/Appointment'; 
import MedicationsPage from './Figma/Medications Component/Medication';


function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<WelcomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/appointments" element={<AppointmentPage />} />
        <Route path="/medications" element={<MedicationsPage />} />
      </Routes>
    </Router>
  );
}

export default App;
