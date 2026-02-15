const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.register = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        // 1. Check if user already exists
        const existingUser = await prisma.user.findUnique({ where: { email } });
        if (existingUser) return res.status(400).json({ message: "Email pehle se majood hai." });

        // 2. Hash Password
        const hashedPassword = await bcrypt.hash(password, 10);

        // 3. Create User (Default: NOT Approved)
        const newUser = await prisma.user.create({
            data: {
                name,
                email,
                password: hashedPassword,
                role: 'STUDENT',
                isApproved: false // Admin approval required!
            }
        });

        res.status(201).json({
            message: "Account ban gaya hai. Admin ki approval ka intezar karein.",
            userId: newUser.id
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};