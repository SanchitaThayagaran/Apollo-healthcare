import React, { useState } from "react";
import Header from "../header";
import "./RiskAssessment.css";

export default function DiabetesRiskForm() {
  // State for all fields
  const [sex, setSex] = useState("");
  const [age, setAge] = useState("");
  const [height, setHeight] = useState("");
  const [weight, setWeight] = useState("");
  const [ethnicity, setEthnicity] = useState("");
  const [smokingStatus, setSmokingStatus] = useState("");
  const [cvd, setCvd] = useState(false);
  const [atypicalAntipsychoticMedication, setAtypicalAntipsychoticMedication] = useState(false);
  const [systemicCorticosteroids, setSystemicCorticosteroids] = useState(false);
  const [bloodPressureTreatment, setBloodPressureTreatment] = useState(false);
  const [gestationalDiabetes, setGestationalDiabetes] = useState(false);
  const [learningDisabilities, setLearningDisabilities] = useState(false);
  const [manicDepressionSchizophrenia, setManicDepressionSchizophrenia] = useState(false);
  const [polycysticOvaries, setPolycysticOvaries] = useState(false);
  const [statins, setStatins] = useState(false);
  const [familyHistoryDiabetes, setFamilyHistoryDiabetes] = useState(false);
  const [fastingBloodGlucose, setFastingBloodGlucose] = useState("");
  const [hba1c, setHba1c] = useState("");

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  // Helper to calculate BMI
  const calculateBMI = () => {
    if (!height || !weight) return 0;
    return (weight / ((height / 100) ** 2)).toFixed(2);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setResult(null);

    // Validation for Fasting blood glucose
    if (fastingBloodGlucose) {
      const fbg = Number(fastingBloodGlucose);
      if (isNaN(fbg) || fbg < 0) {
        setError("Fasting blood glucose must be a non-negative number.");
        return;
      }
    }
    // Validation for HBA1c
    if (hba1c) {
      const hba = Number(hba1c);
      if (isNaN(hba) || hba < 0) {
        setError("HBA1c must be a non-negative number.");
        return;
      }
    }

    setLoading(true);

    // Build payload with only updated fields
    const payload = { requestedEngines: ["QDiabetes"] };
    if (sex) payload.sex = sex;
    if (age) payload.age = Number(age);
    const bmi = calculateBMI();
    if (height && weight && bmi > 0) payload.bmi = Number(bmi);
    if (ethnicity) payload.ethnicity = ethnicity;
    if (smokingStatus) payload.smokingStatus = smokingStatus;
    if (cvd) payload.cvd = cvd;
    if (atypicalAntipsychoticMedication) payload.atypicalAntipsychoticMedication = atypicalAntipsychoticMedication;
    if (systemicCorticosteroids) payload.systemicCorticosteroids = systemicCorticosteroids;
    if (bloodPressureTreatment) payload.bloodPressureTreatment = bloodPressureTreatment;
    if (gestationalDiabetes) payload.gestationalDiabetes = gestationalDiabetes;
    if (learningDisabilities) payload.learningDisabilities = learningDisabilities;
    if (manicDepressionSchizophrenia) payload.manicDepressionSchizophrenia = manicDepressionSchizophrenia;
    if (polycysticOvaries) payload.polycysticOvaries = polycysticOvaries;
    if (statins) payload.statins = statins;
    if (familyHistoryDiabetes) payload.familyHistoryDiabetes = familyHistoryDiabetes;
    if (fastingBloodGlucose) payload.fastingBloodGlucose = Number(fastingBloodGlucose);
    if (hba1c) payload.hba1c = Number(hba1c);

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
      <h1 style={{ textAlign: 'center', marginTop: '20px' }}>Diabetes Risk Assessment</h1>
      <div className="risk-form-wrapper">
        <form className="risk-form-section" onSubmit={handleSubmit}>
          <h2>Personal Information</h2>
          <div className="form-row">
            <div className="form-group">
              <label>Biological Sex <span style={{color: 'red'}}>*</span></label>
              <div className="radio-group">
                <label>
                  <input type="radio" name="sex" value="Female" required checked={sex === "Female"} onChange={() => setSex("Female")} /> Female
                </label>
                <label>
                  <input type="radio" name="sex" value="Male" required checked={sex === "Male"} onChange={() => setSex("Male")} /> Male
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
              <label>Body Mass Index (BMI) <span style={{color: 'red'}}>*</span></label>
              <input type="number" placeholder="Height (cm)" required value={height} onChange={e => setHeight(e.target.value)} />
              <input type="number" placeholder="Weight (kg)" required value={weight} onChange={e => setWeight(e.target.value)} />
              <div style={{fontSize: '0.9em', color: '#888', marginTop: 4}}>BMI: {calculateBMI()}</div>
            </div>
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
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Smoking Status</label>
              <div className="radio-group">
                <label><input type="radio" name="smoking" value="ExSmoker" checked={smokingStatus === "ExSmoker"} onChange={() => setSmokingStatus("ExSmoker")} /> Ex-smoker</label>
                <label><input type="radio" name="smoking" value="LightSmoker" checked={smokingStatus === "LightSmoker"} onChange={() => setSmokingStatus("LightSmoker")} /> Light smoker (less than 10 cigarettes a day)</label>
                <label><input type="radio" name="smoking" value="ModerateSmoker" checked={smokingStatus === "ModerateSmoker"} onChange={() => setSmokingStatus("ModerateSmoker")} /> Moderate smoker (between 10 and 19 cigarettes a day)</label>
                <label><input type="radio" name="smoking" value="HeavySmoker" checked={smokingStatus === "HeavySmoker"} onChange={() => setSmokingStatus("HeavySmoker")} /> Heavy smoker (over 20 cigarettes a day)</label>
                <label><input type="radio" name="smoking" value="NotKnown" checked={smokingStatus === "NotKnown"} onChange={() => setSmokingStatus("NotKnown")} /> Not Known</label>
                <label><input type="radio" name="smoking" value="NonSmoker" checked={smokingStatus === "NonSmoker"} onChange={() => setSmokingStatus("NonSmoker")} /> Non-smoker</label>
              </div>
            </div>
          </div>
          <h2>Clinical Information</h2>
          <div className="form-group checkbox-group">
            <label><input type="checkbox" checked={cvd} onChange={e => setCvd(e.target.checked)} /> Have you had a heart attack, angina, stroke or TIA, or currently taking statins?</label>
            <label><input type="checkbox" checked={atypicalAntipsychoticMedication} onChange={e => setAtypicalAntipsychoticMedication(e.target.checked)} /> On atypical antipsychotic medication?</label>
            <label><input type="checkbox" checked={systemicCorticosteroids} onChange={e => setSystemicCorticosteroids(e.target.checked)} /> Are you on regular steroid tablets?</label>
            <label><input type="checkbox" checked={bloodPressureTreatment} onChange={e => setBloodPressureTreatment(e.target.checked)} /> On blood pressure treatment?</label>
            <label><input type="checkbox" checked={gestationalDiabetes} onChange={e => setGestationalDiabetes(e.target.checked)} /> Do you have gestational diabetes (i.e. diabetes that arose during pregnancy)?</label>
            <label><input type="checkbox" checked={learningDisabilities} onChange={e => setLearningDisabilities(e.target.checked)} /> Learning disabilities?</label>
            <label><input type="checkbox" checked={manicDepressionSchizophrenia} onChange={e => setManicDepressionSchizophrenia(e.target.checked)} /> Manic depression or schizophrenia?</label>
            <label><input type="checkbox" checked={polycysticOvaries} onChange={e => setPolycysticOvaries(e.target.checked)} /> Do you have polycystic ovaries?</label>
            <label><input type="checkbox" checked={statins} onChange={e => setStatins(e.target.checked)} /> Are you on statins?</label>
            <label><input type="checkbox" checked={familyHistoryDiabetes} onChange={e => setFamilyHistoryDiabetes(e.target.checked)} /> Do immediate family (mother, father, brothers or sisters) have diabetes?</label>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Fasting blood glucose (mmol/l):</label>
              <input type="number" step="0.1" value={fastingBloodGlucose} onChange={e => setFastingBloodGlucose(e.target.value)} />
            </div>
            <div className="form-group">
              <label>HBA1c (mmol/mol):</label>
              <input type="number" step="0.1" value={hba1c} onChange={e => setHba1c(e.target.value)} />
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

                  <p>In other words, in a crowd of 100 people with the same risk factors as you, {Math.round(result.riskScore * 100)} are likely to develop heart attack or stroke within the next 10 years.</p>
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
