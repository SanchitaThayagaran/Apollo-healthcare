import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Profile.css';
import Header from '../header';

const Profile = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState({
    date_of_birth: '',
    gender: '',
    insurance_provider: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    // Get user info from local storage
    const token = localStorage.getItem('access');
    const userId = localStorage.getItem('user_id');
    
    if (!token || !userId) {
      navigate('/login');
      return;
    }

    // Fetch the user's profile data
    fetchProfileData(token, userId);
  }, [navigate]);

  const fetchProfileData = async (token, userId) => {
    try {
      setLoading(true);
      const response = await axios.get(`http://localhost:8000/api/accounts/patient-profile/${userId}/`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.data) {
        setProfile({
          date_of_birth: response.data.date_of_birth || '',
          gender: response.data.gender || '',
          insurance_provider: response.data.insurance_provider || ''
        });
      }
      setLoading(false);
    } catch (error) {
      console.error('Error fetching profile:', error);
      setLoading(false);
      // If it's a 404, that's okay - it means the profile needs to be created
      if (error.response && error.response.status !== 404) {
        setError('Failed to load profile data. Please try again.');
      }
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfile(prevProfile => ({
      ...prevProfile,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const token = localStorage.getItem('access');
    const userId = localStorage.getItem('user_id');
    
    if (!token || !userId) {
      navigate('/login');
      return;
    }

    try {
      await axios.put(`http://localhost:8000/api/accounts/patient-profile/${userId}/`, profile, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      setSuccess('Profile updated successfully!');
    } catch (error) {
      console.error('Error updating profile:', error);
      setError('Failed to update profile. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="profile-container">
        <Header />
        <div className="profile-content">
          <div className="profile-loading">Loading profile data...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-container">
      <Header />
      <div className="profile-content">
        <h2>My Profile</h2>
        
        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}
        
        <form onSubmit={handleSubmit} className="profile-form">
          <div className="form-group">
            <label htmlFor="date_of_birth">Date of Birth</label>
            <input
              type="date"
              id="date_of_birth"
              name="date_of_birth"
              value={profile.date_of_birth}
              onChange={handleChange}
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="gender">Gender</label>
            <select
              id="gender"
              name="gender"
              value={profile.gender}
              onChange={handleChange}
            >
              <option value="">Select Gender</option>
              <option value="M">Male</option>
              <option value="F">Female</option>
              <option value="O">Other</option>
            </select>
          </div>
          
          <div className="form-group">
            <label htmlFor="insurance_provider">Insurance Provider</label>
            <input
              type="text"
              id="insurance_provider"
              name="insurance_provider"
              value={profile.insurance_provider}
              onChange={handleChange}
              placeholder="Enter your insurance provider"
            />
          </div>
          
          <button type="submit" className="save-button">Save Profile</button>
        </form>
        
        <div className="nav-buttons">
          <button onClick={() => navigate('/appointments')} className="nav-button">
            Appointments
          </button>
          <button onClick={() => navigate('/medications')} className="nav-button">
            Medications
          </button>
          <button onClick={() => navigate('/risk-assessment')} className="nav-button">
            Risk Assessment
          </button>
        </div>
      </div>
    </div>
  );
};

export default Profile; 