import React, { useState } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import '../header.css';
import './Appointment.css';
import Header from '../header';

function AppointmentPage() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedTime, setSelectedTime] = useState(null);
  const timeSlots = ['9:00 AM', '9:30 AM', '10:00 AM', '10:30 AM', '11:00 AM', '2:00 PM', '2:30 PM'];
  const [showSuccess, setShowSuccess] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState(null);

  const confirmAppointment = () => {
    if (selectedDoctor !== null && selectedTime) {
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    }
  };

  return (
    <div className="page-container">
      <Header />
      <h1 className="section-title">Choose your Appointment:</h1>

      <div className="medication-grid">
        {[...Array(6)].map((_, i) => (
          <div
          key={i}
          className={`doctor-card ${selectedDoctor === i ? 'selected' : ''}`}
          onClick={() => setSelectedDoctor(i)}
        >
          <img src="/Cardiologist.jpg" alt="Doctor" />
          <div className="doc-info">
            <strong>Dr. Alina Fatima</strong>
            <span><b>Specialty:</b> Senior Surgeon</span>
            <span><b>Hours:</b> 09:30 AM – 3:30 PM</span>
            <span><b>Fee:</b> $12</span>
          </div>
          <div className="rating">⭐ 5.0</div>
          <div className="arrow"></div>
        </div>
        
        ))}
      </div>

      <div className="calendar-picker">
        <h3 className="sub-heading">Select Appointment Date</h3>
        <DatePicker
          selected={selectedDate}
          onChange={(date) => setSelectedDate(date)}
          inline
          minDate={new Date()}
        />
      </div>

      <h3 className="sub-heading">Available Time</h3>
      <div className="time-slots">
        {timeSlots.map((time) => (
          <button
            key={time}
            className={`time ${selectedTime === time ? 'selected' : ''}`}
            onClick={() => setSelectedTime(time)}
          >
            {time}
          </button>
        ))}
      </div>

      <button
        className="confirm-button"
        onClick={confirmAppointment}
        disabled={selectedDoctor === null || selectedTime === null}
      >
        Confirm
      </button>

      {showSuccess && (
        <div className="success-notification">
          ✅ Appointment confirmed for {selectedDate.toDateString()} at {selectedTime}
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
