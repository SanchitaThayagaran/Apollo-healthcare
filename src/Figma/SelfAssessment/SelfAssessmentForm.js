import React, { useState } from "react";
import Header from "../header";
import "./SelfAssessment.css";

const SYMPTOMS = {
  general: [
    { id: "fever", label: "Fever or chills", severity: true },
    { id: "fatigue", label: "Fatigue or weakness", severity: true },
    { id: "weight", label: "Unexplained weight loss or gain", severity: false },
    { id: "appetite", label: "Changes in appetite", severity: true },
    { id: "sleep", label: "Sleep problems", severity: true }
  ],
  respiratory: [
    { id: "cough", label: "Cough", severity: true },
    { id: "breathing", label: "Shortness of breath", severity: true },
    { id: "chest", label: "Chest pain or tightness", severity: true },
    { id: "congestion", label: "Nasal congestion", severity: true },
    { id: "sore_throat", label: "Sore throat", severity: true }
  ],
  digestive: [
    { id: "nausea", label: "Nausea or vomiting", severity: true },
    { id: "abdominal", label: "Abdominal pain", severity: true },
    { id: "diarrhea", label: "Diarrhea", severity: true },
    { id: "constipation", label: "Constipation", severity: true },
    { id: "indigestion", label: "Indigestion or heartburn", severity: true }
  ],
  neurological: [
    { id: "headache", label: "Headache", severity: true },
    { id: "dizziness", label: "Dizziness or vertigo", severity: true },
    { id: "memory", label: "Memory problems", severity: true },
    { id: "concentration", label: "Difficulty concentrating", severity: true },
    { id: "mood", label: "Mood changes", severity: true }
  ],
  musculoskeletal: [
    { id: "joint", label: "Joint pain or stiffness", severity: true },
    { id: "muscle", label: "Muscle pain or weakness", severity: true },
    { id: "back", label: "Back pain", severity: true },
    { id: "swelling", label: "Swelling in joints", severity: true },
    { id: "mobility", label: "Difficulty with mobility", severity: true }
  ]
};

const SEVERITY_LEVELS = [
  { value: "mild", label: "Mild" },
  { value: "moderate", label: "Moderate" },
  { value: "severe", label: "Severe" }
];

const DURATION_OPTIONS = [
  { value: "less_than_day", label: "Less than a day" },
  { value: "1_3_days", label: "1-3 days" },
  { value: "4_7_days", label: "4-7 days" },
  { value: "1_2_weeks", label: "1-2 weeks" },
  { value: "more_than_2_weeks", label: "More than 2 weeks" }
];

export default function SelfAssessmentForm() {
  const [currentStep, setCurrentStep] = useState(1);
  const [symptoms, setSymptoms] = useState({});
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  const handleSymptomChange = (category, symptomId, value) => {
    setSymptoms(prev => ({
      ...prev,
      [symptomId]: {
        ...prev[symptomId],
        present: value
      }
    }));
  };

  const handleSeverityChange = (symptomId, value) => {
    setSymptoms(prev => ({
      ...prev,
      [symptomId]: {
        ...prev[symptomId],
        severity: value
      }
    }));
  };

  const handleDurationChange = (symptomId, value) => {
    setSymptoms(prev => ({
      ...prev,
      [symptomId]: {
        ...prev[symptomId],
        duration: value
      }
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setResult(null);
    setLoading(true);

    // Filter out symptoms that are not present
    const presentSymptoms = Object.entries(symptoms).reduce((acc, [id, data]) => {
      if (data.present) {
        acc[id] = data;
      }
      return acc;
    }, {});

    try {
      const response = await fetch("http://localhost:8000/api/self-assessment/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ symptoms: presentSymptoms }),
      });

      if (!response.ok) {
        const errData = await response.json();
        setResult({ error: errData.error || "Failed to analyze symptoms" });
        setLoading(false);
        return;
      }

      const data = await response.json();
      setResult(data);
    } catch (err) {
      setResult({ error: "Failed to analyze symptoms" });
    }
    setLoading(false);
  };

  const renderSymptomInputs = (symptom) => {
    const symptomData = symptoms[symptom.id] || { present: false };
    
    return (
      <div key={symptom.id} className="symptom-item">
        <div className="symptom-main">
          <label>
            <input
              type="checkbox"
              checked={symptomData.present || false}
              onChange={(e) => handleSymptomChange("general", symptom.id, e.target.checked)}
            />
            {symptom.label}
          </label>
        </div>
        {symptomData.present && symptom.severity && (
          <div className="symptom-details">
            <div className="severity-select">
              <label>Severity:</label>
              <select
                value={symptomData.severity || ""}
                onChange={(e) => handleSeverityChange(symptom.id, e.target.value)}
                required
              >
                <option value="">Select severity</option>
                {SEVERITY_LEVELS.map(level => (
                  <option key={level.value} value={level.value}>
                    {level.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="duration-select">
              <label>Duration:</label>
              <select
                value={symptomData.duration || ""}
                onChange={(e) => handleDurationChange(symptom.id, e.target.value)}
                required
              >
                <option value="">Select duration</option>
                {DURATION_OPTIONS.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="symptom-section">
            <h3>General Symptoms</h3>
            {SYMPTOMS.general.map(renderSymptomInputs)}
          </div>
        );
      case 2:
        return (
          <div className="symptom-section">
            <h3>Respiratory Symptoms</h3>
            {SYMPTOMS.respiratory.map(renderSymptomInputs)}
          </div>
        );
      case 3:
        return (
          <div className="symptom-section">
            <h3>Digestive Symptoms</h3>
            {SYMPTOMS.digestive.map(renderSymptomInputs)}
          </div>
        );
      case 4:
        return (
          <div className="symptom-section">
            <h3>Neurological Symptoms</h3>
            {SYMPTOMS.neurological.map(renderSymptomInputs)}
          </div>
        );
      case 5:
        return (
          <div className="symptom-section">
            <h3>Musculoskeletal Symptoms</h3>
            {SYMPTOMS.musculoskeletal.map(renderSymptomInputs)}
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="self-assessment-container">
      <Header />
      <h1 style={{ textAlign: 'center', marginTop: '20px' }}>Self Assessment</h1>
      <div className="self-assessment-wrapper">
        <form className="self-assessment-section" onSubmit={handleSubmit}>
          <div className="progress-bar">
            <div 
              className="progress" 
              style={{ width: `${(currentStep / 5) * 100}%` }}
            />
          </div>
          
          {renderStep()}

          <div className="navigation-buttons">
            {currentStep > 1 && (
              <button
                type="button"
                className="back-btn"
                onClick={() => setCurrentStep(prev => prev - 1)}
              >
                Previous
              </button>
            )}
            {currentStep < 5 ? (
              <button
                type="button"
                className="next-btn"
                onClick={() => setCurrentStep(prev => prev + 1)}
              >
                Next
              </button>
            ) : (
              <button
                type="submit"
                className="submit-btn"
                disabled={loading}
              >
                {loading ? "Analyzing..." : "Submit Assessment"}
              </button>
            )}
          </div>
        </form>

        <div className="assessment-result-section">
          <div className="assessment-result-header">
            <span>Assessment Results</span>
          </div>
          <div className="assessment-result-body">
            {loading && <p>Analyzing your symptoms...</p>}
            {error && <div style={{ color: 'red' }}>{error}</div>}
            {result && !result.error && (
              <div>
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
              </div>
            )}
            {result && result.error && (
              <div style={{ color: 'red' }}>{result.error}</div>
            )}
            {!loading && !result && !error && (
              <p>Please complete the assessment. Results will appear here.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 