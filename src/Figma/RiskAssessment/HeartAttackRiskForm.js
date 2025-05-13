import React, { useState, useEffect } from "react";
import Header from "../header";
import "./RiskAssessment.css";

export default function HeartAttackRiskForm({ onBack, initialAge, initialGender }) {
  // State for all fields
  const [sex, setSex] = useState(initialGender || "");
  const [age, setAge] = useState(initialAge || "");
  const [diabetesStatus, setDiabetesStatus] = useState("None");
  const [height, setHeight] = useState("");
  const [weight, setWeight] = useState("");
  const [ethnicity, setEthnicity] = useState("");
  const [smokingStatus, setSmokingStatus] = useState("");
  const [cvd, setCvd] = useState(false);
  const [atrialFibrillation, setAtrialFibrillation] = useState(false);
  const [atypicalAntipsychoticMedication, setAtypicalAntipsychoticMedication] = useState(false);
  const [systemicCorticosteroids, setSystemicCorticosteroids] = useState(false);
  const [bloodPressureTreatment, setBloodPressureTreatment] = useState(false);
  const [impotence, setImpotence] = useState(false);
  const [migraines, setMigraines] = useState(false);
  const [rheumatoidArthritis, setRheumatoidArthritis] = useState(false);
  const [chronicRenalDisease, setChronicRenalDisease] = useState(false);
  const [severeMentalIllness, setSevereMentalIllness] = useState(false);
  const [systemicLupusErythematosus, setSystemicLupusErythematosus] = useState(false);
  const [familyHistoryCHD, setFamilyHistoryCHD] = useState(false);
  const [cholesterolRatio, setCholesterolRatio] = useState("");
  const [systolicBloodPressure, setSystolicBloodPressure] = useState("");

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  // Update state if props change
  useEffect(() => {
    if (initialGender) setSex(initialGender);
    if (initialAge) setAge(initialAge);
  }, [initialGender, initialAge]);

  // Helper to calculate BMI
  const calculateBMI = () => {
    if (!height || !weight) return 0;
    return (weight / ((height / 100) ** 2)).toFixed(2);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setResult(null);

    // Validation for Cholesterol/HDL ratio
    if (cholesterolRatio) {
      const cr = Number(cholesterolRatio);
      if (isNaN(cr) || cr < 1 || cr > 11) {
        setError("Cholesterol/HDL ratio must be between 1 and 11.");
        return;
      }
    }
    // Validation for Systolic blood pressure
    if (systolicBloodPressure) {
      const sbp = Number(systolicBloodPressure);
      if (isNaN(sbp) || sbp < 70 || sbp > 210) {
        setError("Systolic blood pressure must be between 70 and 210.");
        return;
      }
    }

    setLoading(true);

    // Get user ID from local storage
    const userId = localStorage.getItem('user_id');

    // Build payload with only updated fields
    const payload = { requestedEngines: ["QRisk3"] };
    if (userId) payload.user_id = userId;
    if (sex) payload.sex = sex;
    if (age) payload.age = Number(age);
    if (diabetesStatus) payload.diabetesStatus = diabetesStatus;
    const bmi = calculateBMI();
    if (height && weight && bmi > 0) payload.bmi = Number(bmi);
    if (ethnicity) payload.ethnicity = ethnicity;
    if (smokingStatus) payload.smokingStatus = smokingStatus;
    if (cholesterolRatio) payload.cholesterolRatio = Number(cholesterolRatio);
    if (systolicBloodPressure) {
      payload.systolicBloodPressures = [Number(systolicBloodPressure)];
      payload.systolicBloodPressureMean = Number(systolicBloodPressure);
      payload.systolicBloodPressureStDev = 0;
    }
    if (cvd) payload.cvd = cvd;
    if (atrialFibrillation) payload.atrialFibrillation = atrialFibrillation;
    if (atypicalAntipsychoticMedication) payload.atypicalAntipsychoticMedication = atypicalAntipsychoticMedication;
    if (systemicCorticosteroids) payload.systemicCorticosteroids = systemicCorticosteroids;
    if (bloodPressureTreatment) payload.bloodPressureTreatment = bloodPressureTreatment;
    if (impotence) payload.impotence = impotence;
    if (migraines) payload.migraines = migraines;
    if (rheumatoidArthritis) payload.rheumatoidArthritis = rheumatoidArthritis;
    if (chronicRenalDisease) payload.chronicRenalDisease = chronicRenalDisease;
    if (severeMentalIllness) payload.severeMentalIllness = severeMentalIllness;
    if (systemicLupusErythematosus) payload.systemicLupusErythematosus = systemicLupusErythematosus;
    if (familyHistoryCHD) payload.familyHistoryCHD = familyHistoryCHD;

    try {
      const response = await fetch("http://localhost:8000/api/risk/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!response.ok) {
        const errData = await response.json();
        setResult({ error: errData.error || "Failed to get risk score" });
        setLoading(false);
        return;
      }
      const data = await response.json();
      setResult(data);
    } catch (err) {
      setResult({ error: "Failed to get risk score" });
    }
    setLoading(false);
  };

  return (
    <div className="risk-container">
      <Header />
      <h1 style={{ textAlign: 'center', marginTop: '20px' }}>CardioVascular Risk Assessment</h1>
      <div className="risk-form-wrapper">
        <form className="risk-form-section" onSubmit={handleSubmit}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h2 style={{ margin: 0 }}>Personal Information</h2>
            <div style={{ width: '130px' }}></div> {/* Spacer for alignment */}
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Biological Sex <span style={{color: 'red'}}>*</span></label>
              <div className="radio-group">
                <label>
                  <input type="radio" name="sex" value="Female" required checked={sex === "Female"} onChange={() => setSex("Female")} />
                  Female
                </label>
                <label>
                  <input type="radio" name="sex" value="Male" required checked={sex === "Male"} onChange={() => setSex("Male")} />
                  Male
                </label>
              </div>
            </div>
            <div className="form-group">
              <label>Age (25 - 84) <span style={{color: 'red'}}>*</span></label>
              <input type="number" min="25" max="84" required value={age} onChange={e => setAge(e.target.value)} />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Diabetes?</label>
              <div className="radio-group">
                <label>
                  <input type="radio" name="diabetes" value="Type1" checked={diabetesStatus === "Type1"} onChange={() => setDiabetesStatus("Type1")} />
                  Yes, type 1
                </label>
                <label>
                  <input type="radio" name="diabetes" value="Type2" checked={diabetesStatus === "Type2"} onChange={() => setDiabetesStatus("Type2")} />
                  Yes, type 2
                </label>
                <label>
                  <input type="radio" name="diabetes" value="None" checked={diabetesStatus === "None"} onChange={() => setDiabetesStatus("None")} />
                  None
                </label>
              </div>
            </div>
            <div className="form-group">
              <label>Body Mass Index (BMI) <span style={{color: 'red'}}>*</span></label>
              <input type="number" placeholder="Height (cm)" required value={height} onChange={e => setHeight(e.target.value)} />
              <input type="number" placeholder="Weight (kg)" required value={weight} onChange={e => setWeight(e.target.value)} />
              <div style={{fontSize: '0.9em', color: '#888', marginTop: 4}}>BMI: {calculateBMI()}</div>
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Ethnicity</label>
              <select value={ethnicity} onChange={e => setEthnicity(e.target.value)}>
                <option value="">Select</option>
                <optgroup label="Asian or Asian British">
                  <option>Indian</option>
                  <option>Pakistani</option>
                  <option>Bangladeshi</option>
                  <option>Another Asian background</option>
                  <option>Chinese</option>
                </optgroup>
                <optgroup label="Black, African, Black British or Caribbean">
                  <option>Caribbean</option>
                  <option>African</option>
                  <option>Another Black background</option>
                </optgroup>
                <optgroup label="Mixed or Multiple ethnic groups">
                  <option>Black Caribbean and White</option>
                  <option>Black African and White</option>
                  <option>Asian and White</option>
                  <option>Another Mixed background</option>
                </optgroup>
                <optgroup label="White">
                  <option>British, English, Northern Irish, Scottish, or Welsh</option>
                  <option>Irish</option>
                  <option>Another White background</option>
                </optgroup>
                <optgroup label="Other ethnic group">
                  <option>Not Known</option>
                  <option>Another ethnic background</option>
                  <option>Prefer not to say</option>
                </optgroup>
              </select>
            </div>
            <div className="form-group">
              <label>Smoking Status</label>
              <div className="radio-group">
                <label>
                  <input type="radio" name="smoking" value="ExSmoker" checked={smokingStatus === "ExSmoker"} onChange={() => setSmokingStatus("ExSmoker")} />
                  Ex-smoker
                </label>
                <label>
                  <input type="radio" name="smoking" value="LightSmoker" checked={smokingStatus === "LightSmoker"} onChange={() => setSmokingStatus("LightSmoker")} />
                  Light smoker (less than 10 cigarettes a day)
                </label>
                <label>
                  <input type="radio" name="smoking" value="ModerateSmoker" checked={smokingStatus === "ModerateSmoker"} onChange={() => setSmokingStatus("ModerateSmoker")} />
                  Moderate smoker (between 10 and 19 cigarettes a day)
                </label>
                <label>
                  <input type="radio" name="smoking" value="HeavySmoker" checked={smokingStatus === "HeavySmoker"} onChange={() => setSmokingStatus("HeavySmoker")} />
                  Heavy smoker (over 20 cigarettes a day)
                </label>
                <label>
                  <input type="radio" name="smoking" value="NotKnown" checked={smokingStatus === "NotKnown"} onChange={() => setSmokingStatus("NotKnown")} />
                  Not Known
                </label>
                <label>
                  <input type="radio" name="smoking" value="NonSmoker" checked={smokingStatus === "NonSmoker"} onChange={() => setSmokingStatus("NonSmoker")} />
                  Non-smoker
                </label>
              </div>
            </div>
          </div>
          <h2>Clinical Information</h2>
          <div className="form-group checkbox-group">
            <label>
              <input type="checkbox" checked={cvd} onChange={e => setCvd(e.target.checked)} />
              Have you had a heart attack, angina, stroke or TIA, or currently taking statins?
            </label>
            <label>
              <input type="checkbox" checked={atrialFibrillation} onChange={e => setAtrialFibrillation(e.target.checked)} />
              Atrial fibrillation?
            </label>
            <label>
              <input type="checkbox" checked={atypicalAntipsychoticMedication} onChange={e => setAtypicalAntipsychoticMedication(e.target.checked)} />
              On atypical antipsychotic medication?
            </label>
            <label>
              <input type="checkbox" checked={systemicCorticosteroids} onChange={e => setSystemicCorticosteroids(e.target.checked)} />
              Are you on regular steroid tablets?
            </label>
            <label>
              <input type="checkbox" checked={bloodPressureTreatment} onChange={e => setBloodPressureTreatment(e.target.checked)} />
              On blood pressure treatment?
            </label>
            <label>
              <input type="checkbox" checked={impotence} onChange={e => setImpotence(e.target.checked)} />
              A diagnosis of or treatment for erectile dysfunction?
            </label>
            <label>
              <input type="checkbox" checked={migraines} onChange={e => setMigraines(e.target.checked)} />
              Do you have migraines?
            </label>
            <label>
              <input type="checkbox" checked={rheumatoidArthritis} onChange={e => setRheumatoidArthritis(e.target.checked)} />
              Rheumatoid arthritis?
            </label>
            <label>
              <input type="checkbox" checked={chronicRenalDisease} onChange={e => setChronicRenalDisease(e.target.checked)} />
              Chronic kidney disease (stage 3, 4 or 5)?
            </label>
            <label>
              <input type="checkbox" checked={severeMentalIllness} onChange={e => setSevereMentalIllness(e.target.checked)} />
              Severe mental illness?
            </label>
            <label>
              <input type="checkbox" checked={systemicLupusErythematosus} onChange={e => setSystemicLupusErythematosus(e.target.checked)} />
              Systemic lupus erythematosus (SLE)?
            </label>
            <label>
              <input type="checkbox" checked={familyHistoryCHD} onChange={e => setFamilyHistoryCHD(e.target.checked)} />
              Angina or heart attack in a 1st degree relative &lt; 60
            </label>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Cholesterol/HDL ratio (1 - 11)</label>
              <input type="number" min="1" max="11" step="0.1" value={cholesterolRatio} onChange={e => setCholesterolRatio(e.target.value)} />
            </div>
            <div className="form-group">
              <label>Systolic blood pressure (mmHg) (70-210)</label>
              <input type="number" min="70" max="210" value={systolicBloodPressure} onChange={e => setSystolicBloodPressure(e.target.value)} />
            </div>
          </div>
          {error && <div style={{ color: 'red', marginBottom: 12 }}>{error}</div>}
          <div style={{ textAlign: 'center', marginTop: '24px' }}>
            <button type="submit" className="calculate-risk-btn" disabled={loading}>
              {loading ? "Calculating..." : "Calculate Risk"}
            </button>
          </div>
        </form>
        <div className="risk-result-section">
          <div className="risk-result-header">
            <span>Risk assessment results</span>
          </div>
          <div className="risk-result-body">
            {loading && <p>Calculating risk...</p>}
            {error && <div style={{ color: 'red' }}>{error}</div>}
            {result && !result.error && (
              result.calculationMeta && result.calculationMeta.engineResultStatus === "CALCULATED_USING_ESTIMATED_OR_CORRECTED_DATA" ? (
                <div>
                  <p><b>Absolute risk:</b> {(result.riskScore).toFixed(1)}%</p>
                  {result.typicalScore !== undefined && (
                    <p><b>Absolute risk with no risk factors:</b> {(result.typicalScore).toFixed(1)}%</p>
                  )}
                  <p>This is a comparison with the risk for a person of the same age and sex with no risk factors and a body mass index of {calculateBMI()}.</p>
                  <p><b>Heart Age:</b> {result.heartAge}</p>
                  <p>In other words, in a crowd of 100 people with the same risk factors as you, {Math.round(result.riskScore)} are likely to develop heart attack or stroke within the next 10 years.</p>
                  
                  {result.recommendations && result.recommendations.length > 0 && (
                    <div style={{ marginTop: '20px', borderTop: '1px solid #e0e0e0', paddingTop: '15px' }}>
                      <h4 style={{ color: '#2196f3', marginBottom: '10px' }}>Preventive Recommendations</h4>
                      <ul style={{ paddingLeft: '20px', margin: '0' }}>
                        {result.recommendations.map((rec, index) => (
                          <li key={index} style={{ marginBottom: '8px' }}>{rec}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ) : (
                <div style={{ color: 'red' }}>
                  <b>Calculation failed:</b> {result.calculationMeta && result.calculationMeta.engineResultStatusReason ? result.calculationMeta.engineResultStatusReason : result.message || "Unknown reason"}
                </div>
              )
            )}
            {result && result.error && (
              <div style={{ color: 'red' }}>{result.error}</div>
            )}
            {!loading && !result && !error && <p>Please complete all Required fields. Results will appear here.</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
