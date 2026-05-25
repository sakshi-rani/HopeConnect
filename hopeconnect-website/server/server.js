const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const path = require("path");

dotenv.config({ path: path.join(__dirname, ".env") });

const app = express();
const PORT = process.env.PORT || 5000;
const PUBLIC_DIR = path.join(__dirname, "..", "public");

app.use(express.json());
app.use(express.static(PUBLIC_DIR));

// MongoDB connection
const mongoUri = process.env.MONGO_URI;
if (mongoUri) {
  mongoose.connect(mongoUri)
    .then(() => console.log("MongoDB Connected Successfully"))
    .catch((err) => console.log("MongoDB connection error:", err));
} else {
  console.log("MONGO_URI not set; skipping MongoDB connection.");
}

// Models
const VetAppointment = require("./models/VetAppointment");
const Volunteer = require("./models/Volunteer");
const MedicalRecord = require("./models/MedicalRecord");
const RescueReport = require("./models/RescueReport");

// ─── VET APPOINTMENTS ───────────────────────────────────────────────────────
app.post("/api/vet/appointments", async (req, res) => {
  try {
    const appt = await VetAppointment.create(req.body);
    res.json({ success: true, data: appt });
  } catch (e) {
    res.status(400).json({ success: false, error: e.message });
  }
});

app.get("/api/vet/appointments", async (req, res) => {
  try {
    const appts = await VetAppointment.find().sort({ createdAt: -1 });
    res.json({ success: true, data: appts });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
});

app.patch("/api/vet/appointments/:id", async (req, res) => {
  try {
    const appt = await VetAppointment.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json({ success: true, data: appt });
  } catch (e) {
    res.status(400).json({ success: false, error: e.message });
  }
});

app.delete("/api/vet/appointments/:id", async (req, res) => {
  try {
    await VetAppointment.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (e) {
    res.status(400).json({ success: false, error: e.message });
  }
});

// ─── VOLUNTEERS ──────────────────────────────────────────────────────────────
app.post("/api/vet/volunteers", async (req, res) => {
  try {
    const vol = await Volunteer.create(req.body);
    res.json({ success: true, data: vol });
  } catch (e) {
    res.status(400).json({ success: false, error: e.message });
  }
});

app.get("/api/vet/volunteers", async (req, res) => {
  try {
    const vols = await Volunteer.find().sort({ createdAt: -1 });
    res.json({ success: true, data: vols });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
});

app.patch("/api/vet/volunteers/:id/status", async (req, res) => {
  try {
    const vol = await Volunteer.findByIdAndUpdate(req.params.id, { status: req.body.status }, { new: true });
    res.json({ success: true, data: vol });
  } catch (e) {
    res.status(400).json({ success: false, error: e.message });
  }
});

// ─── MEDICAL RECORDS ─────────────────────────────────────────────────────────
app.post("/api/vet/records", async (req, res) => {
  try {
    const rec = await MedicalRecord.create(req.body);
    res.json({ success: true, data: rec });
  } catch (e) {
    res.status(400).json({ success: false, error: e.message });
  }
});

app.get("/api/vet/records", async (req, res) => {
  try {
    const recs = await MedicalRecord.find().sort({ createdAt: -1 });
    res.json({ success: true, data: recs });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
});

app.delete("/api/vet/records/:id", async (req, res) => {
  try {
    await MedicalRecord.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (e) {
    res.status(400).json({ success: false, error: e.message });
  }
});

// ─── RESCUE REPORTS ──────────────────────────────────────────────────────────
app.post("/api/vet/rescue", async (req, res) => {
  try {
    const report = await RescueReport.create({
      ...req.body,
      timeline: [{ stage: "Reported" }]
    });
    res.json({ success: true, data: report });
  } catch (e) {
    res.status(400).json({ success: false, error: e.message });
  }
});

app.get("/api/vet/rescue", async (req, res) => {
  try {
    const reports = await RescueReport.find().sort({ createdAt: -1 });
    res.json({ success: true, data: reports });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
});

app.patch("/api/vet/rescue/:id/status", async (req, res) => {
  try {
    const { status } = req.body;
    const report = await RescueReport.findByIdAndUpdate(
      req.params.id,
      {
        status,
        $push: { timeline: { stage: status } }
      },
      { new: true }
    );
    res.json({ success: true, data: report });
  } catch (e) {
    res.status(400).json({ success: false, error: e.message });
  }
});

// ─── PAGE ROUTES ─────────────────────────────────────────────────────────────
app.get("/", (req, res) => res.sendFile(path.join(PUBLIC_DIR, "index.html")));
app.get("/human", (req, res) => res.sendFile(path.join(PUBLIC_DIR, "human.html")));
app.get("/animal", (req, res) => res.sendFile(path.join(PUBLIC_DIR, "animal.html")));
app.get("/animal-sos", (req, res) => res.sendFile(path.join(PUBLIC_DIR, "animal-sos.html")));
app.get("/find-vet", (req, res) => res.sendFile(path.join(PUBLIC_DIR, "find-vet.html")));
app.get("/about", (req, res) => res.sendFile(path.join(PUBLIC_DIR, "about.html")));
app.get("/contact", (req, res) => res.sendFile(path.join(PUBLIC_DIR, "contact.html")));
app.get("/specially-abled", (req, res) => res.sendFile(path.join(PUBLIC_DIR, "specially-abled.html")));

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
