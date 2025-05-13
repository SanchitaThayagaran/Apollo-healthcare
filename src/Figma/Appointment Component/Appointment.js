import React, { useState, useEffect } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import '../header.css';
import './Appointment.css';
import Header from '../header';

import axios from 'axios';
import { API_URL } from '../../config';    // ← make sure this path points to your src/config.js

function AppointmentPage() {
  // 1️⃣ Load doctors from the backend
  const [doctors, setDoctors] = useState([]);
  useEffect(() => {
    axios
      .get(`${API_URL}/appointments/doctors/`)
      .then(res => setDoctors(res.data))
      .catch(err => console.error("Failed to load doctors:", err));
  }, []);

  // 2️⃣ Track which doctor, date, and time the user selects
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [selectedDate,   setSelectedDate]   = useState(new Date());
  const [selectedTime,   setSelectedTime]   = useState(null);
  const [showSuccess,    setShowSuccess]    = useState(false);

  // 3️⃣ Define your time slots in ISO format for the API,
  //    but we’ll display them in 12-hour form below
  const timeSlots = [
    "09:00:00","09:30:00","10:00:00",
    "10:30:00","11:00:00","14:00:00",
    "14:30:00"
  ];

  // 4️⃣ When the user clicks Confirm, POST to your Django endpoint
  const confirmAppointment = () => {
    if (selectedDoctor !== null && selectedTime) {
      const payload = {
        // for now, hardcode or pull your patient ID from context/localStorage:
        patient: 2,                 
        doctor:  selectedDoctor,
        date:    selectedDate.toISOString().split("T")[0], // "YYYY-MM-DD"
        time:    selectedTime                            // "HH:mm:ss"
      };

      axios
        .post(
          `${API_URL}/appointments/book/`,
          payload,
          {
            headers: {
              "Content-Type": "application/json",
              // If you protect this endpoint with JWT, add:
              // Authorization: `Bearer ${localStorage.getItem("token")}`
            }
          }
        )
        .then(() => {
          setShowSuccess(true);
          setTimeout(() => setShowSuccess(false), 3000);
        })
        .catch(err => {
          console.error("Booking failed:", err.response || err);
          alert("Failed to book appointment. Check console for details.");
        });
    }
  };

  return (
    <div className="page-container">
      <Header />
      <h1 className="section-title">Choose your Appointment:</h1>

      {/* 🩺 Doctor cards from the API */}
      <div className="medication-grid">
        {doctors.map(doc => (
          <div
            key={doc.id}
            className={`doctor-card ${selectedDoctor === doc.id ? 'selected' : ''}`}
            onClick={() => setSelectedDoctor(doc.id)}
          >
            <img src="/Cardiologist.jpg" alt={doc.name} />
            <div className="doc-info">
              <strong>{doc.name}</strong>
              <span><b>Specialty:</b> {doc.specialty}</span>
            </div>
          </div>
        ))}
      </div>

      {/* 📅 Date picker */}
      <div className="calendar-picker">
        <h3 className="sub-heading">Select Appointment Date</h3>
        <DatePicker
          selected={selectedDate}
          onChange={date => setSelectedDate(date)}
          inline
          minDate={new Date()}
        />
      </div>

      {/* 🕒 Time slots */}
      <h3 className="sub-heading">Available Time</h3>
      <div className="time-slots">
        {timeSlots.map(time => (
          <button
            key={time}
            className={`time ${selectedTime === time ? 'selected' : ''}`}
            onClick={() => setSelectedTime(time)}
          >
            {
              // Display "9:00 AM" style from "09:00:00"
              new Date(`1970-01-01T${time}`)
                .toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })
            }
          </button>
        ))}
      </div>

      {/* ✅ Confirm button */}
      <button
        className="confirm-button"
        onClick={confirmAppointment}
        disabled={selectedDoctor === null || selectedTime === null}
      >
        Confirm
      </button>

      {/* 🎉 Success notification */}
      {showSuccess && (
        <div className="success-notification">
          ✅ Appointment confirmed for{" "}
          {selectedDate.toDateString()} at{" "}
          {new Date(`1970-01-01T${selectedTime}`).toLocaleTimeString([], {
            hour: "numeric",
            minute: "2-digit",
          })}
        </div>
      )}

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

export default AppointmentPage;
