const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.checkByAccessCode = async (req, res) => {
    try {
        const { code } = req.params;

        // Hum sirf wahi fields select karenge jo University ke liye zaroori hain
        const result = await prisma.verificationRequest.findUnique({
            where: { accessCode: code.toUpperCase() }, // Case sensitivity handle karne ke liye
            select: {
                id: true,
                fullName: true,         // Student ka naam jo certificate par hai
                universityName: true,   // Awarding Body
                degreeTitle: true,      // Qualification
                graduationYear: true,
                status: true,           // Submitted, In-Progress, Completed
                verifiedReportUrl: true, // Main PDF Report jo Admin ne verify ki hai
                updatedAt: true,        // Verification Date ke taur par use hoga
                serviceType: true       // Academic ya Employment
            }
        });

        // 1. Agar code database mein nahi milta
        if (!result) {
            return res.status(404).json({
                success: false,
                message: "Invalid Access Code. Please check the code and try again."
            });
        }

        // 2. Agar verification abhi tak mukammal nahi hui
        if (result.status !== 'COMPLETED') {
            return res.status(400).json({
                success: false,
                status: result.status,
                message: "Verification is still in progress. Please check back later."
            });
        }

        // 3. Agar Report URL missing hai (Safety check)
        if (!result.verifiedReportUrl) {
            return res.status(404).json({
                success: false,
                message: "Verified report has not been uploaded yet by the administrator."
            });
        }

        // 4. Sab theek hai, data bhej do
        res.status(200).json({
            success: true,
            data: result
        });

    } catch (error) {
        console.error("University Access Error:", error);
        res.status(500).json({
            success: false,
            error: "An internal server error occurred while fetching the report."
        });
    }
};