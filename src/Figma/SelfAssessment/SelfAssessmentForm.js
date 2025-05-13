import React, { useState, useEffect } from "react";
import Header from "../header";
import "./SelfAssessment.css";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const MAJOR_COMPLAINTS = [
  { value: "chest_pain", label: "Chest pain" },
  { value: "shortness_of_breath", label: "Shortness of breath" },
  { value: "fever", label: "Fever" },
  { value: "headache", label: "Headache" },
  { value: "abdominal_pain", label: "Abdominal pain" },
  { value: "joint_pain", label: "Joint pain" },
  { value: "other", label: "Other (please specify)" }
];

const SYMPTOMS = {
  general: [
    { id: "fever", label: "Fever or chills", key: true },
    { id: "fatigue", label: "Fatigue or weakness", key: false },
    { id: "weight", label: "Unexplained weight loss or gain", key: false },
    { id: "appetite", label: "Changes in appetite", key: false },
    { id: "sleep", label: "Sleep problems", key: false }
  ],
  respiratory: [
    { id: "cough", label: "Cough", key: false },
    { id: "breathing", label: "Shortness of breath", key: true },
    { id: "chest", label: "Chest pain or tightness", key: true },
    { id: "congestion", label: "Nasal congestion", key: false },
    { id: "sore_throat", label: "Sore throat", key: false }
  ],
  digestive: [
    { id: "nausea", label: "Nausea or vomiting", key: false },
    { id: "abdominal", label: "Abdominal pain", key: true },
    { id: "diarrhea", label: "Diarrhea", key: false },
    { id: "constipation", label: "Constipation", key: false },
    { id: "indigestion", label: "Indigestion or heartburn", key: false }
  ],
  neurological: [
    { id: "headache", label: "Headache", key: true },
    { id: "dizziness", label: "Dizziness or vertigo", key: false },
    { id: "memory", label: "Memory problems", key: false },
    { id: "concentration", label: "Difficulty concentrating", key: false },
    { id: "mood", label: "Mood changes", key: false }
  ],
  musculoskeletal: [
    { id: "joint", label: "Joint pain or stiffness", key: true },
    { id: "muscle", label: "Muscle pain or weakness", key: false },
    { id: "back", label: "Back pain", key: false },
    { id: "swelling", label: "Swelling in joints", key: false },
    { id: "mobility", label: "Difficulty with mobility", key: false }
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

// Add follow-up question definitions
const FOLLOW_UPS = {
  chest: [
    { id: 'chest_pain_type', label: 'Describe the chest pain', type: 'select', options: [
      { value: 'sharp', label: 'Sharp' },
      { value: 'dull', label: 'Dull' },
      { value: 'pressure', label: 'Pressure' },
      { value: 'burning', label: 'Burning' },
      { value: 'other', label: 'Other' }
    ]},
    { id: 'chest_pain_radiate', label: 'Does the pain radiate?', type: 'select', options: [
      { value: 'yes', label: 'Yes' },
      { value: 'no', label: 'No' }
    ]},
    { id: 'chest_pain_trigger', label: 'What triggers the pain?', type: 'select', options: [
      { value: 'rest', label: 'At rest' },
      { value: 'exertion', label: 'With exertion' },
      { value: 'eating', label: 'After eating' },
      { value: 'lying', label: 'When lying down' },
      { value: 'other', label: 'Other' }
    ]}
  ],
  breathing: [
    { id: 'sob_onset', label: 'Onset of shortness of breath', type: 'select', options: [
      { value: 'sudden', label: 'Sudden' },
      { value: 'gradual', label: 'Gradual' }
    ]},
    { id: 'sob_when', label: 'When does it occur?', type: 'select', options: [
      { value: 'rest', label: 'At rest' },
      { value: 'activity', label: 'With activity' },
      { value: 'night', label: 'At night' },
      { value: 'lying', label: 'When lying down' },
      { value: 'other', label: 'Other' }
    ]}
  ],
  headache: [
    { id: 'headache_location', label: 'Location of headache', type: 'select', options: [
      { value: 'forehead', label: 'Forehead' },
      { value: 'temple', label: 'Temple' },
      { value: 'back', label: 'Back of head' },
      { value: 'one_side', label: 'One side' },
      { value: 'all_over', label: 'All over' },
      { value: 'other', label: 'Other' }
    ]},
    { id: 'headache_nausea', label: 'Associated with nausea?', type: 'select', options: [
      { value: 'yes', label: 'Yes' },
      { value: 'no', label: 'No' }
    ]}
  ]
};

export default function SelfAssessmentForm() {
  const [step, setStep] = useState(0); // 0: Personal Info, 1: Checklist, 2: Details
  const [personalInfo, setPersonalInfo] = useState({ age: '', sex: '', majorComplaint: '', majorComplaintOther: '' });
  const [checkedSymptoms, setCheckedSymptoms] = useState({});
  const [details, setDetails] = useState({});
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [followUps, setFollowUps] = useState({});
  const [followUpOther, setFollowUpOther] = useState({});
  const [profileLoading, setProfileLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchProfileData();
  }, []);

  const fetchProfileData = async () => {
    const token = localStorage.getItem('access');
    const userId = localStorage.getItem('user_id');

    if (!token || !userId) {
      // Don't redirect, just allow manual entry
      setProfileLoading(false);
      return;
    }
    
    try {
      setProfileLoading(true);
      const response = await axios.get(`http://localhost:8000/api/accounts/patient-profile/${userId}/`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.data) {
        // Calculate age from date_of_birth if available
        let calculatedAge = null;
        if (response.data.date_of_birth) {
          const birthDate = new Date(response.data.date_of_birth);
          const today = new Date();
          calculatedAge = today.getFullYear() - birthDate.getFullYear();
          
          // Adjust age if birthday hasn't occurred yet this year
          const birthMonth = birthDate.getMonth();
          const todayMonth = today.getMonth();
          if (todayMonth < birthMonth || 
              (todayMonth === birthMonth && today.getDate() < birthDate.getDate())) {
            calculatedAge--;
          }
        }
        
        // Map gender from M/F/O to Male/Female for the form
        let mappedGender = null;
        if (response.data.gender === 'M') {
          mappedGender = 'Male';
        } else if (response.data.gender === 'F') {
          mappedGender = 'Female';
        }
        
        setPersonalInfo(prev => ({
          ...prev,
          age: calculatedAge || '',
          sex: mappedGender || ''
        }));
      }
      
      setProfileLoading(false);
    } catch (error) {
      console.error('Error fetching profile:', error);
      setProfileLoading(false);
    }
  };

  // Step 0: Personal Info
  const handlePersonalInfoChange = (field, value) => {
    setPersonalInfo(prev => ({ ...prev, [field]: value }));
  };

  // Step 1: Symptom checklist
  const handleSymptomCheck = (symptomId, checked) => {
    setCheckedSymptoms(prev => ({ ...prev, [symptomId]: checked }));
    if (!checked) {
      setDetails(prev => {
        const newDetails = { ...prev };
        delete newDetails[symptomId];
        return newDetails;
      });
    }
  };

  // Step 2: Details for key symptoms
  const handleDetailChange = (symptomId, field, value) => {
    setDetails(prev => ({
      ...prev,
      [symptomId]: {
        ...prev[symptomId],
        [field]: value
      }
    }));
  };

  // Handle follow-up changes
  const handleFollowUpChange = (symptomId, qId, value) => {
    setFollowUps(prev => ({
      ...prev,
      [symptomId]: {
        ...prev[symptomId],
        [qId]: value
      }
    }));
  };

  // Handle 'other' text input changes
  const handleFollowUpOtherChange = (symptomId, qId, value) => {
    setFollowUpOther(prev => ({
      ...prev,
      [symptomId]: {
        ...prev[symptomId],
        [qId]: value
      }
    }));
  };

  const getAllSymptoms = () =>
    Object.values(SYMPTOMS).flat();

  const getCheckedKeySymptoms = () =>
    getAllSymptoms().filter(s => checkedSymptoms[s.id] && s.key);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setResult(null);
    setLoading(true);

    // Prepare payload: personal info, checked symptoms, with details for key ones
    const payload = {
      personalInfo: {
        ...personalInfo,
        majorComplaint: personalInfo.majorComplaint === 'other' ? personalInfo.majorComplaintOther : personalInfo.majorComplaint
      },
      symptoms: {}
    };
    getAllSymptoms().forEach(symptom => {
      if (checkedSymptoms[symptom.id]) {
        payload.symptoms[symptom.id] = symptom.key
          ? { present: true, ...details[symptom.id], followUps: { ...(followUps[symptom.id] || {}), ...Object.fromEntries(Object.entries(followUpOther[symptom.id] || {}).filter(([k, v]) => (followUps[symptom.id]?.[k] === 'other'))) } }
          : { present: true };
      }
    });

    try {
      const response = await fetch("http://localhost:8000/api/self-assessment/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errData = await response.json();
        setResult({ error: errData.error || "Failed to analyze symptoms" });
        setLoading(false);
        return;
      }

      const data = await response.json();
      // Navigate to results page with result data
      navigate('/self-assessment-result', { state: { result: data } });
    } catch (err) {
      setResult({ error: "Failed to analyze symptoms" });
    }
    setLoading(false);
  };

  // UI rendering
  const renderPersonalInfo = () => (
    <div className="symptom-section">
      <h3>Personal Information</h3>
      {profileLoading ? (
        <div>Loading profile information...</div>
      ) : (
        <>
          <div className="symptom-item">
            <label>Age <span style={{color: 'red'}}>*</span>:
              <input
                type="number"
                min="0"
                max="120"
                value={personalInfo.age}
                onChange={e => handlePersonalInfoChange('age', e.target.value)}
                required
                style={{ marginLeft: 8, width: '250px' }}
              />
            </label>
          </div>
          <div className="symptom-item">
            <label>Sex <span style={{color: 'red'}}>*</span>:
              <select
                value={personalInfo.sex}
                onChange={e => handlePersonalInfoChange('sex', e.target.value)}
                required
                style={{ marginLeft: 8, width: '250px' }}
              >
                <option value="">Select</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
              </select>
            </label>
          </div>
          <div className="symptom-item">
            <label>Major Complaint <span style={{color: 'red'}}>*</span>:
              <select
                value={personalInfo.majorComplaint}
                onChange={e => handlePersonalInfoChange('majorComplaint', e.target.value)}
                required
                style={{ marginLeft: 8, width: '250px' }}
              >
                <option value="">Select</option>
                {MAJOR_COMPLAINTS.map(complaint => (
                  <option key={complaint.value} value={complaint.value}>
                    {complaint.label}
                  </option>
                ))}
              </select>
            </label>
          </div>
          {personalInfo.majorComplaint === 'other' && (
            <div className="symptom-item">
              <label>Please specify:
                <input
                  type="text"
                  value={personalInfo.majorComplaintOther}
                  onChange={e => handlePersonalInfoChange('majorComplaintOther', e.target.value)}
                  required
                  style={{ marginLeft: 8 }}
                />
              </label>
            </div>
          )}
        </>
      )}
    </div>
  );

  const renderChecklist = () => (
    <div className="symptom-section">
      {Object.entries(SYMPTOMS).map(([category, symptoms]) => (
        <div key={category} style={{ marginBottom: 24 }}>
          <h3 style={{ fontWeight: 600 }}>{category.charAt(0).toUpperCase() + category.slice(1)} Symptoms</h3>
          {symptoms.map(symptom => (
            <div key={symptom.id} className="symptom-item">
              <label
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  cursor: 'pointer',
                  width: '100%',
                  fontWeight: 400
                }}
              >
                <input
                  type="checkbox"
                  checked={!!checkedSymptoms[symptom.id]}
                  onChange={e => handleSymptomCheck(symptom.id, e.target.checked)}
                  style={{ width: 18, height: 18 }}
                />
                {symptom.label}
              </label>
            </div>
          ))}
        </div>
      ))}
    </div>
  );

  const renderDetails = () => {
    const keySymptoms = getCheckedKeySymptoms();
    if (keySymptoms.length === 0) return <p>No additional details needed. You can submit your assessment.</p>;
    return (
      <div className="symptom-section">
        <h3>Additional Details for Key Symptoms</h3>
        {keySymptoms.map(symptom => (
          <div key={symptom.id} className="symptom-item">
            <div className="symptom-main">
              {symptom.label}
            </div>
            <div className="symptom-details">
              <div className="severity-select">
                <label>Severity <span style={{color: 'red'}}>*</span>:</label>
                <select
                  value={details[symptom.id]?.severity || ""}
                  onChange={e => handleDetailChange(symptom.id, "severity", e.target.value)}
                  required
                >
                  <option value="">Select severity</option>
                  {SEVERITY_LEVELS.map(level => (
                    <option key={level.value} value={level.value}>{level.label}</option>
                  ))}
                </select>
              </div>
              <div className="duration-select">
                <label>Duration <span style={{color: 'red'}}>*</span>:</label>
                <select
                  value={details[symptom.id]?.duration || ""}
                  onChange={e => handleDetailChange(symptom.id, "duration", e.target.value)}
                  required
                >
                  <option value="">Select duration</option>
                  {DURATION_OPTIONS.map(option => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
              </div>
            </div>
            {/* Conditional follow-ups */}
            {FOLLOW_UPS[symptom.id] && (
              <div className="followup-section">
                {FOLLOW_UPS[symptom.id].map(q => (
                  <div key={q.id} className="followup-item">
                    <label>{q.label} <span style={{color: 'red'}}>*</span>:
                      <select
                        value={followUps[symptom.id]?.[q.id] || ''}
                        onChange={e => handleFollowUpChange(symptom.id, q.id, e.target.value)}
                        required
                      >
                        <option value="">Select</option>
                        {q.options.map(opt => (
                          <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                      </select>
                      {/* Show text input if 'Other' is selected */}
                      {q.options.some(opt => opt.value === 'other') && followUps[symptom.id]?.[q.id] === 'other' && (
                        <input
                          type="text"
                          placeholder="Please specify"
                          value={followUpOther[symptom.id]?.[q.id] || ''}
                          onChange={e => handleFollowUpOtherChange(symptom.id, q.id, e.target.value)}
                          required
                          style={{ marginLeft: 8 }}
                        />
                      )}
                    </label>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    );
  };

  const canProceedToChecklist = personalInfo.age && personalInfo.sex && personalInfo.majorComplaint && (personalInfo.majorComplaint !== 'other' || personalInfo.majorComplaintOther);
  const canProceedToDetails = Object.values(checkedSymptoms).some(Boolean);
  const canSubmit = getCheckedKeySymptoms().every(symptom => {
    const d = details[symptom.id] || {};
    const followupQs = FOLLOW_UPS[symptom.id] || [];
    const f = followUps[symptom.id] || {};
    const fOther = followUpOther[symptom.id] || {};
    return d.severity && d.duration && followupQs.every(q => {
      if (f[q.id] === 'other') return !!fOther[q.id];
      return !!f[q.id];
    });
  });

  return (
    <div className="self-assessment-container">
      <Header />
      <h1 style={{ textAlign: 'center', marginTop: '20px' }}>Self Assessment</h1>
      <div className="self-assessment-wrapper">
        <form className="self-assessment-section" onSubmit={handleSubmit}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <span style={{ fontWeight: 500, fontSize: 16 }}>
              Step {step + 1} of 3
            </span>
          </div>
          <div className="progress-bar">
            <div className="progress" style={{ width: `${(step + 1) * 33.33}%` }} />
          </div>
          {step === 0 && renderPersonalInfo()}
          {step === 1 && renderChecklist()}
          {step === 2 && renderDetails()}
          <div className="navigation-buttons">
            {step > 0 && (
              <button type="button" className="back-btn" onClick={() => setStep(step - 1)}>
                Previous
              </button>
            )}
            {step === 0 && (
              <button
                type="button"
                className="next-btn"
                onClick={() => setStep(1)}
                disabled={!canProceedToChecklist}
              >
                Next
              </button>
            )}
            {step === 1 && (
              <button
                type="button"
                className="next-btn"
                onClick={() => setStep(2)}
                disabled={!canProceedToDetails}
              >
                Next
              </button>
            )}
            {step === 2 && (
              <button
                type="submit"
                className="submit-btn"
                disabled={loading || !canSubmit}
              >
                {loading ? "Analyzing..." : "Submit Assessment"}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
} 