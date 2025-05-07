import React, { useState } from "react";
import HeartAttackRiskForm from "./HeartAttackRiskForm";
import DiabetesRiskForm from "./DiabetesRiskForm";

export default function RiskAssessment() {
  const [selected, setSelected] = useState(null);

  if (selected === "heart") return <HeartAttackRiskForm onBack={() => setSelected(null)} />;
  if (selected === "diabetes") return <DiabetesRiskForm onBack={() => setSelected(null)} />;

  return (
    <div>
      <h2>Risk Assessment</h2>
      <button onClick={() => setSelected("heart")}>Risk of Developing a Heart Attack</button>
      <button onClick={() => setSelected("diabetes")}>Risk of Developing Diabetes</button>
    </div>
  );
}
