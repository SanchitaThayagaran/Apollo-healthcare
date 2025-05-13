import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_URL } from '../../config'; // Make sure this path points to your src/config.js
import './AppointmentList.css';
import Header from '../header';

function AppointmentList() {
  // 1️⃣ Load appointments from the backend
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const email = localStorage.getItem('email'); // Get the email from localStorage
  const role = localStorage.getItem('role');   // Get the role from localStorage
  const access = localStorage.getItem('access'); // Get the token
  console.log(email)

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const response = await axios.get(`${API_URL}/appointments/filtered/`, {
          params: { email, role },
          headers: {
            Authorization: `Bearer ${access}`,
          },
        });
        setAppointments(response.data);
      } catch (error) {
        console.error('Error fetching appointments:', error);
        alert('Failed to load appointments. Check console for details.');
      } finally {
        setLoading(false);
      }
    };

    fetchAppointments();
  }, [email, role, access]);

  // 2️⃣ Loading UI
  if (loading) {
    return <div>Loading appointments...</div>;
  }

  return (
    <div className="page-container">
      <Header />
      <h1 className="section-title">Your Appointments</h1>

      {/* 🩺 Display appointments based on the role */}
      <div className="appointment-grid">
        {appointments.length > 0 ? (
          appointments.map(appt => (
            <div key={appt.id} className="appointment-card">
              <div className="appointment-info">
                <strong>Doctor:</strong> {appt.doctor_name}
                <div><b>Date:</b> {new Date(appt.date).toLocaleDateString()}</div>
                <div><b>Time:</b> {new Date(`1970-01-01T${appt.time}`).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}</div>
                <div><b>Status:</b> {appt.status}</div>
              </div>
            </div>
          ))
        ) : (
          <div>No appointments found.</div>
        )}
      </div>

      <footer className="footer">
        <p>APOLLO HEALTHCARE</p>
        <div>
          <p>SERVICES</p>
          <ul>
            <li>PATHOLOGY</li>
            <li>CARDIOLOGY</li>
            <li>PHARMACY</li>
          </ul>
        </div>
      </footer>
    </div>
  );
}

export default AppointmentList;
