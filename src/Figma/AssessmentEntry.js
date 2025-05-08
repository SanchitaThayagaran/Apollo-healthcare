// src/Figma/AssessmentEntry.js
import React from "react";
import { useNavigate } from "react-router-dom";
import "./AssessmentEntry.css";
import Header from "./header";
export default function AssessmentEntry() {
  const navigate = useNavigate();

  return (
    <div className="assessment-entry-page">
        <Header />
      <h2 className="assessment-entry-title">Choose your Assessment</h2>
      <div className="assessment-cards-row">
        <div className="assessment-card">
          <h3>Risk Assessment</h3>
          <p>
            As a patient, assess your risk for conditions like diabetes and heart disease based on lifestyle, medical history, and key health markers. The system generates risk scores and provides preventive recommendations such as dietary changes or lifestyle modifications.<br /><br />
            As a healthcare provider, access patient risk assessments to proactively monitor individuals at high risk and provide early intervention strategies. If a patient is flagged as high risk, you can schedule follow-ups or suggest diagnostic tests.
          </p>
          <button onClick={() => navigate('/risk-assessment')}>Take Assessment</button>
        </div>
        <div className="assessment-card">
          <h3>Self Assessment</h3>
          <p>
            As a patient, complete a self-assessment questionnaire to check for potential health issues based on your symptoms. The system analyzes your responses and provides preliminary insights, suggesting whether you should seek medical attention. If your symptoms indicate urgency, you'll receive recommendations for booking an appointment with a healthcare provider.<br /><br />
            As a healthcare provider, review patient self-assessment results to better understand their concerns before a consultation.
          </p>
          <button /* onClick={...} */>Take Assessment</button>
        </div>
      </div>
    </div>
  );
}