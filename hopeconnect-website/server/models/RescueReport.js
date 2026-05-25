const mongoose = require('mongoose');

const RescueReportSchema = new mongoose.Schema({
  reporterName: { type: String, required: true },
  phone: { type: String, required: true },
  lat: Number,
  lng: Number,
  locationText: String,
  injuryCondition: String,
  animalType: String,
  imageUrl: String,
  status: { type: String, default: 'Reported' },
  // timeline: Reported > Volunteer Assigned > On The Way > Animal Picked > Reached Hospital > Treatment Started > Recovered
  timeline: [{ stage: String, ts: { type: Date, default: Date.now } }],
  assignedVolunteer: { type: mongoose.Schema.Types.ObjectId, ref: 'Volunteer' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('RescueReport', RescueReportSchema);
