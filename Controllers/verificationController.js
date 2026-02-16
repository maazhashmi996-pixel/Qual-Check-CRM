const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const crypto = require('crypto');

// 1. CREATE REQUEST: Student apni details aur files submit karega
exports.createRequest = async (req, res) => {
    try {
        const {
            fullName,
            universityName,
            degreeTitle,
            graduationYear,
            registrationNo,
            serviceType,
            packageType,
            degreeDoc,     // Cloudinary URL frontend se ayega
            transcriptDoc, // Cloudinary URL frontend se ayega
            passportDoc    // Cloudinary URL frontend se ayega
        } = req.body;

        const studentId = req.user.id;

        // Unique Access Code generate karna University ke liye
        const accessCode = crypto.randomBytes(4).toString('hex').toUpperCase();

        const newRequest = await prisma.verificationRequest.create({
            data: {
                studentId,
                fullName,
                universityName,
                degreeTitle,
                graduationYear: parseInt(graduationYear),
                registrationNo,
                serviceType,
                packageType,
                accessCode,
                degreeDoc,
                transcriptDoc,
                passportDoc,
                status: 'SUBMITTED'
            }
        });

        res.status(201).json({
            message: "Verification request submit ho gayi hai!",
            request: newRequest
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// 2. GET ALL REQUESTS (FOR ADMIN): Admin saari requests dekh sake
exports.getAllRequests = async (req, res) => {
    try {
        const requests = await prisma.verificationRequest.findMany({
            include: { student: { select: { name: true, email: true } } },
            orderBy: { createdAt: 'desc' }
        });
        res.json(requests);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// 3. ADMIN UPDATE & UPLOAD: Admin verified report upload karega aur status change karega
exports.adminUploadReport = async (req, res) => {
    try {
        const { requestId } = req.params;
        const { verifiedReportUrl, status } = req.body; // status can be 'COMPLETED' or 'IN_PROGRESS'

        const updatedRequest = await prisma.verificationRequest.update({
            where: { id: requestId },
            data: {
                verifiedReportUrl,
                status: status || 'COMPLETED',
            }
        });

        res.json({
            message: "Report successfully uploaded and status updated.",
            request: updatedRequest
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// 4. GET STUDENT REQUESTS: Student sirf apni requests dekh sake
exports.getMyRequests = async (req, res) => {
    try {
        const requests = await prisma.verificationRequest.findMany({
            where: { studentId: req.user.id },
            orderBy: { createdAt: 'desc' }
        });
        res.json(requests);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// 5. UNIVERSITY ACCESS: Bina login ke Access Code se report dekhna
exports.getReportByAccessCode = async (req, res) => {
    try {
        const { code } = req.params;

        const request = await prisma.verificationRequest.findUnique({
            where: { accessCode: code },
            select: {
                fullName: true,
                universityName: true,
                degreeTitle: true,
                status: true,
                verifiedReportUrl: true, // Ye wahi file hai jo Admin ne upload ki
                createdAt: true
            }
        });

        if (!request) return res.status(404).json({ message: "Invalid Access Code." });
        if (request.status !== 'COMPLETED') return res.status(400).json({ message: "Report abhi tayyar nahi hui." });

        res.json(request);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};