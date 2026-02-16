const express = require('express');
const router = express.Router();
const {
    createRequest,
    getMyRequests,
    getAllRequests,
    adminUploadReport,
    getReportByAccessCode
} = require('../Controllers/verificationController');

const { protect, adminOnly } = require('../middleware/authMiddleware');

// ==========================================
// STUDENT ROUTES (Protected)
// ==========================================

// 1. Nayi verification request submit karna
router.post('/submit', protect, createRequest);

// 2. Student apni saari requests ki history dekh sake
router.get('/my-requests', protect, getMyRequests);


// ==========================================
// ADMIN ROUTES (Protected + Admin Only)
// ==========================================

// 3. Admin saari requests dekh sake (Manage karne ke liye)
router.get('/admin/all', protect, adminOnly, getAllRequests);

// 4. Admin verified report upload kare aur status "Completed" kare
router.put('/admin/upload/:requestId', protect, adminOnly, adminUploadReport);


// ==========================================
// UNIVERSITY / PUBLIC ROUTE
// ==========================================

// 5. University sirf Access Code se report dekh sake (No Login Required)
router.get('/verify/:code', getReportByAccessCode);

module.exports = router;