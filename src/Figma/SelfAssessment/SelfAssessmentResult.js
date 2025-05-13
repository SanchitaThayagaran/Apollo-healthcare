import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Header from "../header";

export default function SelfAssessmentResult() {
  const location = useLocation();
  const navigate = useNavigate();
  const result = location.state?.result;

  // If no result, redirect back to self-assessment
  React.useEffect(() => {
    if (!result) {
      navigate("/self-assessment");
    }
  }, [result, navigate]);

  if (!result) return null;

  return (
    <div className="self-assessment-container">
      <Header />
      <h1 style={{ textAlign: 'center', marginTop: '20px' }}>Assessment Results</h1>
      <div className="self-assessment-wrapper">
        <div className="assessment-result-section">
          <div className="assessment-result-header">
            <span>Assessment Results</span>
          </div>
          <div className="assessment-result-body">
            <h3>Preliminary Analysis</h3>
            <p>{result.analysis}</p>
            {result.recommendations && (
              <>
                <h3>Recommendations</h3>
                <ul>
                  {result.recommendations.map((rec, index) => (
                    <li key={index}>{rec}</li>
                  ))}
                </ul>
              </>
            )}
            {result.urgency && (
              <div className={`urgency-level ${result.urgency.toLowerCase()}`}>
                <h3>Urgency Level: {result.urgency}</h3>
                <p>{result.urgencyExplanation}</p>
              </div>
            )}
            {/* Action Buttons */}
            <div style={{ marginTop: 16, display: 'flex', gap: '12px' }}>
              <button
                type="button"
                onClick={() => window.print()}
                style={{
                  background: "#2196f3",
                  color: "#fff",
                  border: "none",
                  borderRadius: 4,
                  padding: "8px 20px",
                  fontWeight: 600,
                  fontSize: 15,
                  cursor: "pointer"
                }}
              >
                Print / Download as PDF
              </button>
              <button
                type="button"
                onClick={() => navigate('/appointments')}
                style={{
                  background: "#4CAF50",
                  color: "#fff",
                  border: "none",
                  borderRadius: 4,
                  padding: "8px 20px",
                  fontWeight: 600,
                  fontSize: 15,
                  cursor: "pointer"
                }}
              >
                Book Appointment
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 