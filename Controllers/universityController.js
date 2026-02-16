exports.checkByAccessCode = async (req, res) => {
    try {
        const { code } = req.params;

        const result = await prisma.verificationRequest.findUnique({
            where: { accessCode: code },
            select: {
                fullName: true,
                universityName: true,
                degreeTitle: true,
                status: true,
                verifiedReportUrl: true, // Sirf verified report dikhayein
                updatedAt: true
            }
        });

        if (!result) return res.status(404).json({ message: "Invalid Access Code." });

        if (result.status !== 'COMPLETED') {
            return res.status(400).json({ message: "Verification abhi process mein hai." });
        }

        res.json(result);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};