import React, { useState, useEffect } from "react";
import HeartAttackRiskForm from "./HeartAttackRiskForm";
import DiabetesRiskForm from "./DiabetesRiskForm";
import "./RiskAssessment.css";
import Header from "../header";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function RiskAssessment() {
  const [selected, setSelected] = useState(null);
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchProfileData();
  }, []);

  const fetchProfileData = async () => {
    const token = localStorage.getItem('access');
    const userId = localStorage.getItem('user_id');
    
    if (!token || !userId) {
      navigate('/login');
      return;
    }
    
    try {
      setLoading(true);
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
        
        // Map gender from M/F/O to Male/Female for the risk forms
        let mappedGender = null;
        if (response.data.gender === 'M') {
          mappedGender = 'Male';
        } else if (response.data.gender === 'F') {
          mappedGender = 'Female';
        }
        
        setProfileData({
          age: calculatedAge,
          gender: mappedGender
        });
      }
      
      setLoading(false);
    } catch (error) {
      console.error('Error fetching profile:', error);
      setLoading(false);
    }
  };

  if (selected === "heart") return <HeartAttackRiskForm onBack={() => setSelected(null)} initialAge={profileData?.age} initialGender={profileData?.gender} />;
  if (selected === "diabetes") return <DiabetesRiskForm onBack={() => setSelected(null)} initialAge={profileData?.age} initialGender={profileData?.gender} />;

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
