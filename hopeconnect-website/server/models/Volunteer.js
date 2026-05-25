const mongoose = require('mongoose');

const VolunteerSchema = new mongoose.Schema({
  name: { type: String, required: true },
  phone: { type: String, required: true },
  location: String,
  vehicleType: String,
  activeTiming: String,
  status: { type: String, default: 'Available' }, // Available, Busy, Offline
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Volunteer', VolunteerSchema);
