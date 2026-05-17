const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const path = require("path");

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const PUBLIC_DIR = __dirname;

app.use(express.static(PUBLIC_DIR));

const mongoUri = process.env.MONGO_URI;
if (mongoUri) {
  mongoose.connect(mongoUri)
    .then(() => console.log("MongoDB Connected Successfully"))
    .catch((err) => console.log("MongoDB connection error:", err));
} else {
  console.log("MONGO_URI not set; skipping MongoDB connection.");
}

app.get("/", (req, res) => {
  res.sendFile(path.join(PUBLIC_DIR, "index.html"));
});

app.get("/human", (req, res) => {
  res.sendFile(path.join(PUBLIC_DIR, "human.html"));
});

app.get("/animal", (req, res) => {
  res.sendFile(path.join(PUBLIC_DIR, "animal.html"));
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});