const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const path = require("path");

dotenv.config(path.join(__dirname, ".env"));

const app = express();
const PORT = process.env.PORT || 5000;
const PUBLIC_DIR = path.join(__dirname, "..", "public");

app.use(express.static(PUBLIC_DIR));

const mongoUri = process.env.MONGO_URI;
if (mongoUri) {
  mongoose.connect(mongoUri)
    .then(() => console.log("MongoDB Connected Successfully"))
    .catch((err) => console.log("MongoDB connection error:", err));
} else {
  console.log("MONGO_URI not set; skipping MongoDB connection.");
}

// Root route
app.get("/", (req, res) => {
  res.sendFile(path.join(PUBLIC_DIR, "index.html"));
});

// Page routes
app.get("/human", (req, res) => {
  res.sendFile(path.join(PUBLIC_DIR, "human.html"));
});

app.get("/animal", (req, res) => {
  res.sendFile(path.join(PUBLIC_DIR, "animal.html"));
});

app.get("/about", (req, res) => {
  res.sendFile(path.join(PUBLIC_DIR, "about.html"));
});

app.get("/contact", (req, res) => {
  res.sendFile(path.join(PUBLIC_DIR, "contact.html"));
});

app.get("/specially-abled", (req, res) => {
  res.sendFile(path.join(PUBLIC_DIR, "specially-abled.html"));
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
