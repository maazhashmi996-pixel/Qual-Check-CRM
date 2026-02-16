const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const crypto = require('crypto'); // Unique Access Code ke liye

exports.createRequest = async (req, res) => {
    try {
        const {
            fullName,
            universityName,
            degreeTitle,
            graduationYear,
            registrationNo,
            serviceType,
            packageType
        } = req.body;

        // Student ID humein "protect" middleware se mil jayegi (req.user.id)
        const studentId = req.user.id;

        // Ek unique Access Code generate karna (University ke liye)
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
                // Files ke URLs hum tab save karenge jab upload logic connect hoga
                degreeDoc: req.body.degreeDoc,
                transcriptDoc: req.body.transcriptDoc,
                passportDoc: req.body.passportDoc,
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