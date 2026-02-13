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
    const { registerNumber, name } = req.body;

    const student = await Student.findOne({ registerNumber });

    if (student && student.name.toLowerCase() === name.toLowerCase()) {
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
    const { registerNumber, name, department, year, email } = req.body;

    const studentExists = await Student.findOne({ registerNumber });

    if (studentExists) {
        res.status(400);
        throw new Error('Student already exists');
    }

    const student = await Student.create({
        registerNumber,
        name,
        department,
        year,
        email: email === '' ? undefined : email
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
});

export { authAdmin, registerAdmin, authStudent, registerStudent };
