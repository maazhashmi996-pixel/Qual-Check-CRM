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
            degreeDoc,
            transcriptDoc,
            passportDoc
        } = req.body;

        const studentId = req.user.id;

        // Unique Access Code (Upper Case for better readability)
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
            include: {
                student: {
                    select: { name: true, email: true }
                }
            },
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
        const { verifiedReportUrl, status } = req.body;

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

// 5. UNIVERSITY ACCESS: Access Code se report dekhna (Case Insensitive)
exports.getReportByAccessCode = async (req, res) => {
    try {
        const { code } = req.params;

        const request = await prisma.verificationRequest.findUnique({
            where: { accessCode: code.toUpperCase() }, // Added toUpperCase() safety
            select: {
                fullName: true,
                universityName: true,
                degreeTitle: true,
                status: true,
                verifiedReportUrl: true,
                createdAt: true,
                serviceType: true,
                graduationYear: true
            }
        });

        if (!request) return res.status(404).json({ message: "Invalid Access Code." });

        // Agar status Completed nahi hai, toh University ko report nahi dikhani
        if (request.status !== 'COMPLETED') {
            return res.status(400).json({
                message: "Verification is still in progress. Please try again later.",
                status: request.status
            });
        }

        res.json(request);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// 6. DELETE REQUEST (Optional Admin Feature): Fake ya ghalat requests delete karne ke liye
exports.deleteRequest = async (req, res) => {
    try {
        const { requestId } = req.params;
        await prisma.verificationRequest.delete({
            where: { id: requestId }
        });
        res.json({ message: "Request deleted successfully." });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};