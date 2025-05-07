import React from "react";
import Header from "../header";
import "./RiskAssessment.css";

export default function DiabetesRiskForm() {
  return (
    <div className="risk-container">
      <Header />
      <h1 style={{ textAlign: 'center', marginTop: '20px' }}>Diabetes Risk Assessment</h1>
      <div className="risk-form-wrapper">
        <div className="risk-form-section">
          <h2>Personal Information</h2>
          <div className="form-row">
            <div className="form-group">
              <label>Biological Sex <span style={{color: 'red'}}>*</span></label>
              <div className="radio-group">
                <label><input type="radio" name="sex" required /> Female</label>
                <label><input type="radio" name="sex" required /> Male</label>
              </div>
            </div>
            <div className="form-group">
              <label>Age (25 - 84) <span style={{color: 'red'}}>*</span></label>
              <input type="number" min="25" max="84" required />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Body Mass Index (BMI) <span style={{color: 'red'}}>*</span></label>
              <input type="number" placeholder="Height (cm)" required />
              <input type="number" placeholder="Weight (kg)" required />
            </div>
            <div className="form-group">
              <label>Ethnicity</label>
              <select defaultValue="">
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
                <label><input type="radio" name="smoking" /> Ex-smoker</label>
                <label><input type="radio" name="smoking" /> Light smoker (less than 10 cigarettes a day)</label>
                <label><input type="radio" name="smoking" /> Moderate smoker (between 10 and 19 cigarettes a day)</label>
                <label><input type="radio" name="smoking" /> Heavy smoker (over 20 cigarettes a day)</label>
                <label><input type="radio" name="smoking" /> Not Known</label>
                <label><input type="radio" name="smoking" /> Non-smoker</label>
              </div>
            </div>
          </div>
          <h2>Clinical Information</h2>
          <div className="form-group checkbox-group">
            <label><input type="checkbox" /> Have you had a heart attack, angina, stroke or TIA, or currently taking statins?</label>
            <label><input type="checkbox" /> On atypical antipsychotic medication?</label>
            <label><input type="checkbox" /> Are you on regular steroid tablets?</label>
            <label><input type="checkbox" /> On blood pressure treatment?</label>
            <label><input type="checkbox" /> Do you have gestational diabetes (i.e. diabetes that arose during pregnancy)?</label>
            <label><input type="checkbox" /> Learning disabilities?</label>
            <label><input type="checkbox" /> Manic depression or schizophrenia?</label>
            <label><input type="checkbox" /> Do you have polycystic ovaries?</label>
            <label><input type="checkbox" /> Are you on statins?</label>
            <label><input type="checkbox" /> Do immediate family (mother, father, brothers or sisters) have diabetes?</label>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Fasting blood glucose (mmol/l):</label>
              <input type="number" step="0.1" />
            </div>
            <div className="form-group">
              <label>HBA1c (mmol/mol):</label>
              <input type="number" step="0.1" />
            </div>
          </div>
          <div style={{ textAlign: 'center', marginTop: '24px' }}>
            <button type="submit" className="calculate-risk-btn">Calculate Risk</button>
          </div>
        </div>
        <div className="risk-result-section">
          <div className="risk-result-header">
            <span>Risk assessment results</span>
            <button className="pending-btn">Pending...</button>
          </div>
          <div className="risk-result-body">
            <p>Please complete all Required fields. Results will appear here.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
