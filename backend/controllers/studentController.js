import asyncHandler from 'express-async-handler';
import Student from '../models/Student.js';

// @desc    Register a new student (Admin only)
// @route   POST /api/students
// @access  Private/Admin
const createStudent = asyncHandler(async (req, res) => {
    let { registerNumber, name, department, year, dob, bloodGroup, gender, address, emergencyContact, validUpto, templateType, email, officialEmail, studentType } = req.body;

    // Map officialEmail to email if email is missing (common in single registration form)
    if (!email && officialEmail) {
        email = officialEmail;
    }

    if (registerNumber) registerNumber = registerNumber.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
    if (name) name = name.toUpperCase();
    if (department) department = department.trim().toUpperCase();
    if (year) year = year.trim().toUpperCase();

    const studentExists = await Student.findOne({ registerNumber });

    if (studentExists) {
        res.status(400);
        throw new Error('Student already exists');
    }

    console.log('Request Body:', req.body);
    console.log('Request File:', req.file);

    let photoUrl = '';

    if (req.file) {
        photoUrl = req.file.path; // Cloudinary secure_url
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

    // Handle automatic template selection if not explicitly provided
    if (!templateType && studentType) {
        if (studentType === 'Hosteller') {
            templateType = '3';
        } else {
            templateType = '4'; // Default for Days Scholar
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
        templateType,
        email,
        officialEmail,
        studentType: studentType || 'Days Scholar',
        status: 'Approved', // Admin created students are approved by default
        source: 'Admin',
        approvalDate: Date.now(),
        history: [{
            status: 'Approved',
            message: 'Account created and approved by Admin',
            updatedBy: 'Admin',
            timestamp: Date.now()
        }]
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
        const changedFields = [];
        const transitions = [];

        if (req.body.dob && req.body.dob !== student.dob?.toISOString()?.split('T')[0]) {
            student.dob = req.body.dob;
            changedFields.push('Date of Birth');
        }
        if (req.body.bloodGroup && req.body.bloodGroup !== student.bloodGroup) {
            student.bloodGroup = req.body.bloodGroup;
            changedFields.push('Blood Group');
        }
        if (req.body.gender && req.body.gender !== student.gender) {
            student.gender = req.body.gender;
            changedFields.push('Gender');
        }
        if (req.body.address && req.body.address !== student.address) {
            student.address = req.body.address;
            changedFields.push('Address');
        }
        if (req.body.emergencyContact && req.body.emergencyContact !== student.emergencyContact) {
            student.emergencyContact = req.body.emergencyContact;
            changedFields.push('Emergency Contact');
        }
        if (req.body.parentPhone && req.body.parentPhone !== student.parentPhone) {
            student.parentPhone = req.body.parentPhone;
            changedFields.push('Parent Phone');
        }

        if (req.body.officialEmail && req.body.officialEmail !== student.officialEmail) {
            if (!req.body.officialEmail.endsWith('@bitsathy.ac.in')) {
                res.status(400);
                throw new Error('Official Email must end with @bitsathy.ac.in');
            }
            student.officialEmail = req.body.officialEmail;
            changedFields.push('Official Email');
        }

        if (req.body.year && req.body.year !== student.year) {
            transitions.push(`Academic Year from ${student.year} to ${req.body.year}`);
            student.year = req.body.year;
        }

        if (req.body.validUpto && req.body.validUpto !== student.validUpto) {
            student.validUpto = req.body.validUpto;
            changedFields.push('Validity');
        }

        if (req.body.studentType && req.body.studentType !== student.studentType) {
            transitions.push(`Student Type from ${student.studentType} to ${req.body.studentType}`);
            student.studentType = req.body.studentType;
            student.templateType = req.body.studentType === 'Hosteller' ? '3' : '4';
        }

        if (req.file) {
            student.photoUrl = req.file.path; // Cloudinary secure_url
            changedFields.push('Photo');
        }

        // Combine standard field changes and specific transitions
        const allChanges = [...transitions];
        if (changedFields.length > 0) {
            allChanges.push(`Updated: ${changedFields.join(', ')}`);
        }

        // Only log and update if there are actual changes
        if (allChanges.length > 0) {
            student.status = 'Pending';
            student.rejectionReason = undefined;
            student.source = 'Student';

            student.history.push({
                status: 'Pending',
                message: allChanges.join(' | '),
                updatedBy: 'Student',
                timestamp: Date.now()
            });

            try {
                const updatedStudent = await student.save();
                res.json(updatedStudent);
            } catch (error) {
                res.status(400);
                throw new Error(`Update failed: ${error.message}`);
            }
        } else {
            res.json(student); // No changes made
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
            student.approvalDate = undefined;
            student.history.push({
                status: 'Rejected',
                message: `Admin rejected application: ${rejectionReason}`,
                updatedBy: 'Admin',
                timestamp: Date.now()
            });
        } else if (status === 'Approved') {
            student.rejectionReason = undefined;
            student.approvalDate = Date.now();
            student.history.push({
                status: 'Approved',
                message: 'Admin approved application',
                updatedBy: 'Admin',
                timestamp: Date.now()
            });
        } else {
            student.rejectionReason = undefined;
        }

        try {
            const updatedStudent = await student.save();
            res.json(updatedStudent);
        } catch (error) {
            res.status(400);
            throw new Error(`Verification failed: ${error.message}`);
        }
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
            let { registerNumber, name, department, year, email } = studentData;

            if (registerNumber) registerNumber = registerNumber.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
            if (name) name = name.toUpperCase();
            if (department) department = department.trim().toUpperCase();
            if (year) year = year.trim().toUpperCase();

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
                status: 'Approved', // Bulk sourced students are usually already approved
                source: 'Bulk',
                approvalDate: Date.now(),
                history: [{
                    status: 'Approved',
                    message: 'Student data imported via Bulk Sourcing',
                    updatedBy: 'Admin',
                    timestamp: Date.now()
                }]
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

// @desc    Get student by registration number for public verification
// @route   GET /api/students/verify/:registerNumber
// @access  Public
const verifyStudentPublic = asyncHandler(async (req, res) => {
    const { registerNumber } = req.params;
    const student = await Student.findOne({ registerNumber }).select('name registerNumber department year photoUrl status studentType validUpto bloodGroup source approvalDate rejectionReason history createdAt');

    if (student) {
        res.json(student);
    } else {
        res.status(404);
        throw new Error('Student not found');
    }
});

export {
    createStudent,
    getStudents,
    getStudentProfile,
    updateStudentProfile,
    verifyStudent,
    bulkCreateStudents,
    verifyStudentPublic
};
