import React, { useState } from "react";
import HeartAttackRiskForm from "./HeartAttackRiskForm";
import DiabetesRiskForm from "./DiabetesRiskForm";
import "./RiskAssessment.css";
import Header from "../header";
export default function RiskAssessment() {
  const [selected, setSelected] = useState(null);

  if (selected === "heart") return <HeartAttackRiskForm onBack={() => setSelected(null)} />;
  if (selected === "diabetes") return <DiabetesRiskForm onBack={() => setSelected(null)} />;

  return (
    <div className="risk-assessment-page">
        <Header />
      <h2 className="risk-assessment-title">Risk Assessment</h2>
      <div className="risk-assessment-cards-row">
        <div className="risk-assessment-card">
          <h3>Cardiovascular Disease Risk</h3>
          <p>
            This tool estimates your likelihood of experiencing a heart attack or stroke within the next 10 years, provided you do not already have cardiovascular disease and are not currently taking statins. The risk score is calculated using a validated algorithm, as detailed in <a href="https://www.bmj.com/content/357/bmj.j2099" target="_blank" rel="noopener noreferrer">this academic study</a>.
          </p>
          <button onClick={() => setSelected("heart")}>Start Assessment</button>
        </div>
        <div className="risk-assessment-card">
          <h3>Type 2 Diabetes Risk</h3>
          <p>
            Use this calculator to estimate your chance of developing Type 2 Diabetes in the next 10 years by answering a few straightforward questions. It is designed for individuals who do not already have a diagnosis of Type 2 Diabetes. The risk score is based on an updated, peer-reviewed algorithm described in <a href="https://www.bmj.com/content/359/bmj.j5019" target="_blank" rel="noopener noreferrer">this research paper</a>.
          </p>
          <button onClick={() => setSelected("diabetes")}>Start Assessment</button>
        </div>
      </div>
    </div>
  );
}
