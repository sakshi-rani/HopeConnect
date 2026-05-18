const mongoose = require('mongoose');

const VetAppointmentSchema = new mongoose.Schema({
  owner: { type: String, required: true },
  phone: { type: String, required: true },
  petName: String,
  animalType: String,
  visitType: String,
  hospital: String,
  date: String,
  time: String,
  symptoms: String,
  isEmergency: { type: Boolean, default: false },
  status: { type: String, default: 'Confirmed' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('VetAppointment', VetAppointmentSchema);
