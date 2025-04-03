import React, { useState } from 'react';
import './Medication.css';
import Header from '../header';

function MedicationsPage() {
    
  const [medications, setMedications] = useState([
    {
      name: "Amoxicillin",
      dosage: "2 tablets daily",
      quantity: "12 tablets left",
      refillDate: "Apr 8",
      image: "medication.png"
    },
    {
      name: "Paracetamol",
      dosage: "1 tablet after meals",
      quantity: "8 tablets left",
      refillDate: "Apr 5",
      image: "medication.png"
    },
    {
        name: "Allegra",
        dosage: "1 tablet after breakfast",
        quantity: "20 tablets left",
        refillDate: "Apr 14",
        image: "medication.png"
      }
  ]);

  const [newMed, setNewMed] = useState({ 
    name: '', 
    dosage: '', 
    quantity: '', 
    refillDate: '', 
    image: 'medication.png' // default image for all meds
  });
  
  const [editingIndex, setEditingIndex] = useState(null);
  const [showForm, setShowForm] = useState(false);

  const handleChange = (e) => {
    setNewMed({ ...newMed, [e.target.name]: e.target.value });
  };

  const handleSubmit = () => {
    if (editingIndex !== null) {
      const updated = [...medications];
      updated[editingIndex] = newMed;
      setMedications(updated);
    } else {
      setMedications([...medications, newMed]);
    }
    setNewMed({ name: '', dosage: '', quantity: '', refillDate: '' });
    setEditingIndex(null);
    setShowForm(false);
  };

  const handleDelete = (index) => {
    const updated = medications.filter((_, i) => i !== index);
    setMedications(updated);
  };

  const handleEdit = (index) => {
    setNewMed(medications[index]);
    setEditingIndex(index);
    setShowForm(true);
  };

  return (
    <div className="medications-container">
        <Header/>
      <h1>Your Medications</h1>

      <button className="add-med-btn" onClick={() => setShowForm(true)}>+ Add Medication</button>

      {showForm && (
        <div className="form-modal">
          <input name="name" value={newMed.name} placeholder="Medication Name" onChange={handleChange} />
          <input name="dosage" value={newMed.dosage} placeholder="Dosage" onChange={handleChange} />
          <input name="quantity" value={newMed.quantity} placeholder="Quantity" onChange={handleChange} />
          <input name="refillDate" value={newMed.refillDate} placeholder="Refill Date (e.g., Apr 12)" onChange={handleChange} />
          <div>
            <button onClick={handleSubmit}>{editingIndex !== null ? "Update" : "Add"}</button>
            <button className="cancel-btn" onClick={() => { setShowForm(false); setEditingIndex(null); }}>Cancel</button>
          </div>
        </div>
      )}

      <div className="medication-grid">
        {medications.map((med, index) => (
         <div className="med-card" key={index}>
         <img src={med.image} alt={med.name} className="med-img" />
         <h2>{med.name}</h2>
         <p><strong>Dosage:</strong> {med.dosage}</p>
         <p><strong>Quantity:</strong> {med.quantity}</p>
         <p><strong>Next refill:</strong> {med.refillDate}</p>
         <div className="card-actions">
           <button onClick={() => handleEdit(index)}>Edit</button>
           <button className="delete-btn" onClick={() => handleDelete(index)}>Delete</button>
         </div>
       </div>
        ))}
      </div>
    </div>
  );
}

export default MedicationsPage;
