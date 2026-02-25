import asyncHandler from 'express-async-handler';
import Admin from '../models/Admin.js';
import Student from '../models/Student.js';
import generateToken from '../utils/generateToken.js';

// @desc    Auth command & get token
// @route   POST /api/users/login
// @access  Public
const authAdmin = asyncHandler(async (req, res) => {
    const { username, password } = req.body;

    const admin = await Admin.findOne({ username });

    if (!process.env.JWT_SECRET) {
        res.status(500);
        throw new Error('JWT_SECRET is missing in environment variables');
    }

    if (admin && (await admin.matchPassword(password))) {
        res.json({
            _id: admin._id,
            username: admin.username,
            token: generateToken(admin._id),
        });
    } else {
        res.status(401);
        throw new Error('Invalid email or password');
    }
});

// @desc    Register a new admin (for setup)
// @route   POST /api/users
// @access  Public (should be protected or removed in prod)
const registerAdmin = asyncHandler(async (req, res) => {
    const { username, password } = req.body;

    const adminExists = await Admin.findOne({ username });

    if (adminExists) {
        res.status(400);
        throw new Error('Admin already exists');
    }

    const admin = await Admin.create({
        username,
        password,
    });

    if (admin) {
        res.status(201).json({
            _id: admin._id,
            username: admin.username,
            token: generateToken(admin._id),
        });
    } else {
        res.status(400);
        throw new Error('Invalid admin data');
    }
});

// @desc    Auth student & get token (Login)
// @route   POST /api/students/login
// @access  Public
// @desc    Auth student & get token (Login)
// @route   POST /api/students/login
// @access  Public
const authStudent = asyncHandler(async (req, res) => {
    let { registerNumber, name } = req.body;

    if (registerNumber) registerNumber = registerNumber.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
    if (name) name = name.toUpperCase();

    const student = await Student.findOne({ registerNumber });

    if (!process.env.JWT_SECRET) {
        res.status(500);
        throw new Error('JWT_SECRET is missing in environment variables');
    }

    if (student && student.name.toUpperCase() === name) {
        res.json({
            _id: student._id,
            registerNumber: student.registerNumber,
            name: student.name,
            photoUrl: student.photoUrl,
            status: student.status,
            token: generateToken(student._id),
            role: 'student'
        });
    } else {
        res.status(401);
        throw new Error('Invalid Register Number or Name');
    }
});

// @desc    Register a new student
// @route   POST /api/students/signup
// @access  Public
const registerStudent = asyncHandler(async (req, res) => {
    let { registerNumber, name, department, year, email, studentType } = req.body;

    if (!registerNumber || !name || !department || !year || !email) {
        res.status(400);
        throw new Error('Please include all required fields');
    }

    registerNumber = registerNumber.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
    name = name.toUpperCase();
    department = department.trim().toUpperCase();
    year = year.trim().toUpperCase();
    email = email.trim();

    if (email && !email.endsWith('@bitsathy.ac.in')) {
        res.status(400);
        throw new Error('Email must end with @bitsathy.ac.in');
    }

    const studentExists = await Student.findOne({
        $or: [
            { registerNumber },
            { email }
        ]
    });

    if (studentExists) {
        res.status(400);
        throw new Error('Student with this Register Number or Email already exists');
    }

    // Determine templateType based on studentType
    let templateType = '4'; // Default for Days Scholar
    if (studentType === 'Hosteller') {
        templateType = '3';
    }

    try {
        const student = await Student.create({
            registerNumber,
            name,
            department,
            year,
            email,
            studentType: studentType || 'Days Scholar',
            templateType,
            history: [{
                status: 'Registered',
                message: 'Student account created',
                updatedBy: 'Student',
                timestamp: Date.now()
            }]
        });

        if (student) {
            res.status(201).json({
                _id: student._id,
                registerNumber: student.registerNumber,
                name: student.name,
                token: generateToken(student._id),
                role: 'student'
            });
        } else {
            res.status(400);
            throw new Error('Invalid student data');
        }
    } catch (error) {
        res.status(400);
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(val => val.message);
            throw new Error(messages.join(', '));
        } else if (error.code === 11000) {
            throw new Error('Duplicate field value entered');
        } else {
            throw new Error(error.message);
        }
    }
});

export { authAdmin, registerAdmin, authStudent, registerStudent };
