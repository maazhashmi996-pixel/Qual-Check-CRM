// src/index.js
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const authRoutes = require('./Routes/authRoutes');
const verificationRoutes = require('./Routes/verificationRoutes'); // Naya route import kiya

dotenv.config();

const app = express();

// Middlewares
app.use(cors());
app.use(express.json()); // JSON data handle karne ke liye
app.use(express.urlencoded({ extended: true })); // Form data handle karne ke liye

// ==========================
// ROUTES
// ==========================

// Auth Routes (Login, Register, Approval)
app.use('/api/auth', authRoutes);

// Verification Routes (Submission, Admin Upload, University Check)
app.use('/api/verification', verificationRoutes);

// ==========================
// GLOBAL ERROR HANDLING
// ==========================
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        success: false,
        message: "Server mein kuch kharabi agayi hai.",
        error: process.env.NODE_ENV === 'development' ? err.message : {}
    });
});

// Health Check
app.get('/', (req, res) => {
    res.send('CRM Backend is running perfectly...');
});

// Server Listening
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`----------------------------------------`);
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log(`✅ Auth Routes: /api/auth`);
    console.log(`✅ Verification Routes: /api/verification`);
    console.log(`----------------------------------------`);
});