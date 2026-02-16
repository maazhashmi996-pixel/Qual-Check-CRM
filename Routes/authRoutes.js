const express = require('express');
const router = express.Router();
// Controllers (Dhyan rakhein ke folder ka naam 'Controllers' hai ya 'controllers', JS case-sensitive hai)
const {
    register,
    login,
    approveUser,
    getMe,
    getPendingUsers
} = require('../Controllers/authController');

const { protect, adminOnly } = require('../middleware/authMiddleware');

// ==========================
// PUBLIC ROUTES
// ==========================
router.post('/signup', register);
router.post('/login', login);

// ==========================
// PROTECTED ROUTES (Student & Admin)
// ==========================
// Ye route frontend par check karega ke user logged in hai ya approved hai
router.get('/me', protect, getMe);

// ==========================
// ADMIN ONLY ROUTES
// ==========================
// Pending users ki list dekhne ke liye taake admin approval de sakay
router.get('/pending-users', protect, adminOnly, getPendingUsers);

// User ko approve karne ke liye
router.put('/approve/:userId', protect, adminOnly, approveUser);

module.exports = router;