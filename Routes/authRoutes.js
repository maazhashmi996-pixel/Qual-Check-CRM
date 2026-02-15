// src/routes/authRoutes.js
const express = require('express');
const router = express.Router();
const { register, login, approveUser } = require('../Controllers/authController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

// Public Routes
router.post('/signup', register);
router.post('/login', login);

// Admin Only Route (Ismein "protect" token check karega aur "adminOnly" role check karega)
router.put('/approve/:userId', protect, adminOnly, approveUser);

module.exports = router;