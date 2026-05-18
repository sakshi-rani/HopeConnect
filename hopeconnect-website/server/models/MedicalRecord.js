const mongoose = require('mongoose');

const MedicalRecordSchema = new mongoose.Schema({
  petName: { type: String, required: true },
  age: String,
  breed: String,
  ownerName: String,
  ownerPhone: String,
  vaccinations: [{ vaccine: String, date: String, nextDue: String }],
  allergies: String,
  treatments: [{ description: String, date: String, doctor: String }],
  prescriptions: [{ medicine: String, dosage: String, duration: String }],
  medications: String,
  doctorNotes: String,
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('MedicalRecord', MedicalRecordSchema);
