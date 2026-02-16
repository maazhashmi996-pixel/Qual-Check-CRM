const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// 1. REGISTER: Naya student account banana (Default: Pending Approval)
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
                isApproved: false // User login nahi kar sakega jab tak ye true na ho
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

// 2. LOGIN: Check karna ke account approved hai ya nahi
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) return res.status(404).json({ message: "User nahi mila." });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ message: "Ghalat password." });

        // CHECK: Agar user student hai aur approved nahi hai, toh rok dein
        if (user.role === 'STUDENT' && !user.isApproved) {
            return res.status(403).json({
                message: "Aapka account admin ki approval ka muntazir hai. Login filhal band hai."
            });
        }

        const token = jwt.sign(
            { id: user.id, role: user.role, isApproved: user.isApproved },
            process.env.JWT_SECRET,
            { expiresIn: '1d' }
        );

        res.json({
            token,
            user: { id: user.id, name: user.name, role: user.role, isApproved: user.isApproved }
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// 3. GET PROFILE: User ka status aur details check karne ke liye
exports.getMe = async (req, res) => {
    try {
        const user = await prisma.user.findUnique({
            where: { id: req.user.id },
            select: { id: true, name: true, email: true, role: true, isApproved: true }
        });
        res.json(user);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// 4. ADMIN APPROVE: Admin kisi bhi pending user ko approve kar sake
exports.approveUser = async (req, res) => {
    try {
        const { userId } = req.params;
        const updatedUser = await prisma.user.update({
            where: { id: userId },
            data: { isApproved: true }
        });
        res.json({
            message: "User account approve kar diya gaya hai.",
            user: updatedUser.email
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// 5. GET ALL PENDING USERS: Admin dekh sake kitne log approval maang rahe hain
exports.getPendingUsers = async (req, res) => {
    try {
        const pendingUsers = await prisma.user.findMany({
            where: {
                isApproved: false,
                role: 'STUDENT'
            },
            select: {
                id: true,
                name: true,
                email: true,
                createdAt: true
            }
        });
        res.json(pendingUsers);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.rejectUser = async (req, res) => {
    try {
        const { userId } = req.params;
        await prisma.user.delete({
            where: { id: userId }
        });
        res.json({ message: "User request rejected and account deleted." });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};