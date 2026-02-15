// src/index.js
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const authRoutes = require('./routes/authRoutes');

dotenv.config();

const app = express();

// Middlewares
app.use(cors());
app.use(express.json()); // JSON data handle karne ke liye

// Routes
app.use('/api/auth', authRoutes);

// Health Check
app.get('/', (req, res) => {
    res.send('CRM Backend is running...');
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});