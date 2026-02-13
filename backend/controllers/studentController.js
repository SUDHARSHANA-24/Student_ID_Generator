import asyncHandler from 'express-async-handler';
import Student from '../models/Student.js';

// @desc    Register a new student (Admin only)
// @route   POST /api/students
// @access  Private/Admin
const createStudent = asyncHandler(async (req, res) => {
    const { registerNumber, name, department, year, dob, bloodGroup, gender, address, emergencyContact, validUpto, templateType } = req.body;

    const studentExists = await Student.findOne({ registerNumber });

    if (studentExists) {
        res.status(400);
        throw new Error('Student already exists');
    }

    console.log('Request Body:', req.body);
    console.log('Request File:', req.file);

    let photoUrl = '';

    if (req.file) {
        photoUrl = req.file.path;
    } else {
        // Use default image based on gender
        const gender = req.body.gender;
        if (gender === 'Male') {
            photoUrl = 'uploads\\default-boy.png';
        } else if (gender === 'Female') {
            photoUrl = 'uploads\\default-girl.png';
        } else {
            res.status(400);
            throw new Error(`Please upload a photo or select a valid gender. Received: ${gender}`);
        }
    }

    const student = await Student.create({
        registerNumber,
        name,
        department,
        year,
        dob,
        bloodGroup,
        gender,
        address,
        emergencyContact,
        validUpto,
        photoUrl,
        templateType
    });

    if (student) {
        res.status(201).json(student);
    } else {
        res.status(400);
        throw new Error('Invalid student data');
    }
});

// @desc    Get all students
// @route   GET /api/students
// @access  Private/Admin
const getStudents = asyncHandler(async (req, res) => {
    const students = await Student.find({});
    res.json(students);
});

// @desc    Get student profile
// @route   GET /api/students/profile
// @access  Private/Student
const getStudentProfile = asyncHandler(async (req, res) => {
    const student = await Student.findById(req.student._id);

    if (student) {
        res.json(student);
    } else {
        res.status(404);
        throw new Error('Student not found');
    }
});

// @desc    Update student profile (Student only)
// @route   PUT /api/students/profile
// @access  Private/Student
const updateStudentProfile = asyncHandler(async (req, res) => {
    const student = await Student.findById(req.student._id);

    if (student) {
        student.dob = req.body.dob || student.dob;
        student.bloodGroup = req.body.bloodGroup || student.bloodGroup;
        student.gender = req.body.gender || student.gender;
        student.address = req.body.address || student.address;
        student.emergencyContact = req.body.emergencyContact || student.emergencyContact;
        student.parentPhone = req.body.parentPhone || student.parentPhone;
        student.officialEmail = req.body.officialEmail || student.officialEmail;
        student.validUpto = req.body.validUpto || student.validUpto;

        // Handle Student Type and automatic template selection
        if (req.body.studentType) {
            student.studentType = req.body.studentType;
            student.templateType = req.body.studentType === 'Hosteller' ? '2' : '1';
        }

        if (req.file) {
            student.photoUrl = req.file.path;
        }

        // Set status to Pending whenever a student completes/updates their profile
        student.status = 'Pending';
        student.rejectionReason = undefined;

        try {
            const updatedStudent = await student.save();
            res.json(updatedStudent);
        } catch (error) {
            res.status(400);
            throw new Error(`Update failed: ${error.message}`);
        }
    } else {
        res.status(404);
        throw new Error('Student not found');
    }
});

// @desc    Verify/Approve/Reject student (Admin only)
// @route   PUT /api/students/:id/verify
// @access  Private/Admin
const verifyStudent = asyncHandler(async (req, res) => {
    const { status, rejectionReason } = req.body;
    const student = await Student.findById(req.params.id);

    if (student) {
        student.status = status;
        if (status === 'Rejected') {
            student.rejectionReason = rejectionReason;
        } else {
            student.rejectionReason = undefined;
        }

        const updatedStudent = await student.save();
        res.json(updatedStudent);
    } else {
        res.status(404);
        throw new Error('Student not found');
    }
});

// @desc    Bulk create students (Admin only)
// @route   POST /api/students/bulk
// @access  Private/Admin
const bulkCreateStudents = asyncHandler(async (req, res) => {
    const { students } = req.body;

    if (!students || !Array.isArray(students)) {
        res.status(400);
        throw new Error('Invalid students data');
    }

    const createdStudents = [];
    const errors = [];

    for (const studentData of students) {
        try {
            const { registerNumber, name, department, year, email } = studentData;

            const studentExists = await Student.findOne({ registerNumber });
            if (studentExists) {
                errors.push({ registerNumber, error: 'Student already exists' });
                continue;
            }

            const student = await Student.create({
                registerNumber,
                name,
                department,
                year,
                email,
                status: 'Approved' // Bulk sourced students are usually already approved
            });

            createdStudents.push(student);
        } catch (error) {
            errors.push({ registerNumber: studentData.registerNumber, error: error.message });
        }
    }

    res.status(201).json({
        message: `Successfully created ${createdStudents.length} students`,
        createdCount: createdStudents.length,
        errors
    });
});

export {
    createStudent,
    getStudents,
    getStudentProfile,
    updateStudentProfile,
    verifyStudent,
    bulkCreateStudents
};
