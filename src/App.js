import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';

import WelcomePage from './Figma/Welcome Component/Welcome';
import LoginPage from './Figma/Login Component/LoginFigma';
import AppointmentPage from './Figma/Appointment Component/Appointment'; 
import MedicationsPage from './Figma/Medications Component/Medication';
import RiskAssessmentPage from './Figma/RiskAssessment/RiskAssessment';
import AssessmentEntry from './Figma/AssessmentEntry';
import SelfAssessmentForm from './Figma/SelfAssessment/SelfAssessmentForm';
import ProfilePage from './Figma/Profile Component/Profile';
import SelfAssessmentResult from './Figma/SelfAssessment/SelfAssessmentResult';
import AppointmentList from './Figma/Appointment List Component/AppointmentList';

function App() {
  return (
    <GoogleOAuthProvider clientId="900988189639-7skbctltl07q5g29st5ao9u5i9lemq4r.apps.googleusercontent.com">
      <Router>
        <Routes>
          <Route path="/" element={<WelcomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/appointments" element={<AppointmentPage />} />
          <Route path="/medications" element={<MedicationsPage />} />
          <Route path="/risk-assessment" element={<RiskAssessmentPage />} />
          <Route path="/assessment-entry" element={<AssessmentEntry />} />
          <Route path="/self-assessment" element={<SelfAssessmentForm />} />
          <Route path="/filterappointment" element={<AppointmentList />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/self-assessment-result" element={<SelfAssessmentResult />} />
        </Routes>
      </Router>
    </GoogleOAuthProvider>
  );
}

export default App;
