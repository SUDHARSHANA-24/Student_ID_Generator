import asyncHandler from 'express-async-handler';
import Student from '../models/Student.js';
import Notification from '../models/Notification.js';
import { performOCRVerification } from '../utils/ocrUtil.js';

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
    const pageSize = 10;
    const page = Number(req.query.pageNumber) || 1;
    const status = req.query.status && req.query.status !== 'All' ? req.query.status : null;
    const keyword = req.query.keyword
        ? {
            $or: [
                { name: { $regex: req.query.keyword, $options: 'i' } },
                { registerNumber: { $regex: req.query.keyword, $options: 'i' } },
            ],
        }
        : {};

    const query = { ...keyword };
    if (status) query.status = status;

    const count = await Student.countDocuments(query);
    
    // Custom sort: Pending first (0), Registered (1), then Approved/Rejected/others (2+), all sorted by updatedAt
    const students = await Student.aggregate([
        { $match: query },
        {
            $addFields: {
                statusRank: {
                    $switch: {
                        branches: [
                            { case: { $eq: ["$status", "Pending"] }, then: 0 },
                            { case: { $eq: ["$status", "Registered"] }, then: 1 },
                            { case: { $eq: ["$status", "Approved"] }, then: 2 },
                            { case: { $eq: ["$status", "Rejected"] }, then: 3 },
                            { case: { $eq: ["$status", "Discontinued"] }, then: 4 }
                        ],
                        default: 10
                    }
                }
            }
        },
        { $sort: { statusRank: 1, updatedAt: -1 } },
        { $skip: (page - 1) * pageSize },
        { $limit: pageSize }
    ]);

    // Get global stats
    const stats = await Student.aggregate([
        {
            $group: {
                _id: '$status',
                count: { $sum: 1 },
            },
        },
    ]);

    const statsObj = {
        Total: 0,
        Pending: 0,
        Approved: 0,
        Rejected: 0,
        Discontinued: 0,
        Registered: 0
    };

    stats.forEach(stat => {
        if (stat._id) statsObj[stat._id] = stat.count;
        statsObj.Total += stat.count;
    });

    res.json({ 
        students, 
        page, 
        pages: Math.ceil(count / pageSize), 
        total: count,
        stats: statsObj 
    });
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

        if (req.body.name && req.body.name.toUpperCase() !== student.name) {
            student.name = req.body.name.toUpperCase();
            changedFields.push('Name');
        }
        if (req.body.department && req.body.department.toUpperCase() !== student.department) {
            student.department = req.body.department.toUpperCase();
            changedFields.push('Department');
        }
        if (req.body.dob && req.body.dob !== (student.dob ? student.dob.toISOString().split('T')[0] : '')) {
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

        // Handle File Uploads (Photo and Specific Proofs)
        const photoFile = req.files?.photo ? req.files.photo[0] : null;
        const aadhaarProof = req.files?.aadhaarProof ? req.files.aadhaarProof[0] : null;
        const birthCertProof = req.files?.birthCertProof ? req.files.birthCertProof[0] : null;
        const admissionProof = req.files?.admissionProof ? req.files.admissionProof[0] : null;

        if (photoFile) {
            student.photoUrl = photoFile.path;
            changedFields.push('Photo');
        }

        const uploadedProofs = [];
        if (aadhaarProof) uploadedProofs.push(aadhaarProof.path);
        if (birthCertProof) uploadedProofs.push(birthCertProof.path);
        if (admissionProof) uploadedProofs.push(admissionProof.path);

        if (uploadedProofs.length > 0) {
            student.proofUrls = uploadedProofs;
            student.proofUrl = uploadedProofs[0]; // For backward compatibility
        }

        // Only log and update if there are actual changes
        const dataFieldsChanged = transitions.length > 0 || changedFields.length > 0;
        
        if (dataFieldsChanged || uploadedProofs.length > 0) {
            // Requirement check: If already approved and changing data, MUST submit proof
            if (student.status === 'Approved' && dataFieldsChanged && uploadedProofs.length === 0 && !student.proofUrl && (!student.proofUrls || student.proofUrls.length === 0)) {
                res.status(400);
                throw new Error('Please submit a proof document for the changes to be approved.');
            }

            const allChangesLog = [...transitions];
            if (changedFields.length > 0) {
                allChangesLog.push(`Updated: ${changedFields.join(', ')}`);
            }

            student.status = 'Pending';
            student.rejectionReason = undefined;
            student.source = 'Student';

            student.history.push({
                status: 'Pending',
                message: allChangesLog.join(' | ') + (uploadedProofs.length > 0 ? ` [Proof Attached: ${uploadedProofs.length} files]` : ''),
                updatedBy: 'Student',
                timestamp: Date.now()
            });
            try {
                // Perform OCR Verification if proofs are attached
                if (uploadedProofs.length > 0) {
                    const fieldsToVerify = {
                        name: req.body.name || student.name,
                        registerNumber: student.registerNumber,
                        dob: req.body.dob || (student.dob ? student.dob.toISOString().split('T')[0] : ''),
                        address: req.body.address || student.address,
                        department: req.body.department || student.department,
                        studentType: req.body.studentType || student.studentType,
                        mobile: req.body.emergencyContact || student.emergencyContact
                    };

                    let allVerifiedFields = new Set();
                    let allOcrText = [];

                    for (const filePath of uploadedProofs) {
                        const { verifiedFields, ocrText } = await performOCRVerification(filePath, fieldsToVerify);
                        verifiedFields.forEach(f => allVerifiedFields.add(f));
                        allOcrText.push(ocrText);
                    }
                    
                    student.verifiedFields = Array.from(allVerifiedFields);
                    student.ocrText = allOcrText;
                    student.isAutoVerified = student.verifiedFields.length > 0;

                    // Update history with verification results
                    if (student.isAutoVerified) {
                        student.history[student.history.length - 1].message += ` | [Auto-Verified: ${student.verifiedFields.join(', ')}]`;
                        
                        // Automatically approve if OCR finds matching data!
                        student.status = 'Approved';
                        student.approvalDate = Date.now();
                        student.history.push({
                            status: 'Approved',
                            message: `System automatically approved application based on successful document OCR verification (${student.verifiedFields.join(', ')})`,
                            updatedBy: 'System',
                            timestamp: Date.now()
                        });
                    }
                } else if (!student.proofUrl && (!student.proofUrls || student.proofUrls.length === 0)) {
                    // Reset if no proof exists anyway
                    student.isAutoVerified = false;
                    student.verifiedFields = [];
                    student.ocrText = [];
                }

                const updatedStudent = await student.save();

                // Create notification for admin
                const notificationMessage = student.isAutoVerified
                    ? `Student ${student.name} (${student.registerNumber}) updated their profile. The changes were Automatically Verified and Approved by the system AI.`
                    : `Student ${student.name} (${student.registerNumber}) has requested an ID card update/approval. Manual verification is needed.`;

                await Notification.create({
                    userType: 'Admin',
                    recipient: 'admin',
                    message: notificationMessage
                });

                if (student.isAutoVerified) {
                    await Notification.create({
                        userType: 'Student',
                        recipient: student.registerNumber,
                        message: 'Great news! Your profile changes were automatically verified by our AI system and instantly approved!'
                    });
                }

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

            // Notify Student
            await Notification.create({
                userType: 'Student',
                recipient: student.registerNumber,
                message: status === 'Approved' 
                    ? `Your ID card request has been Approved!` 
                    : `Your ID card request has been ${status}. ${rejectionReason ? 'Reason: ' + rejectionReason : ''}`
            });

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
            console.log('Processing student data:', studentData);
            let { 
                registerNumber, name, department, year, email, dob, 
                bloodGroup, gender, photoUrl, address, emergencyContact, 
                parentPhone, studentType, officialEmail, validUpto, templateType 
            } = studentData;

            if (registerNumber) registerNumber = String(registerNumber).replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
            if (name) name = String(name).toUpperCase();
            if (department) department = String(department).trim().toUpperCase();
            if (year) year = String(year).trim().toUpperCase();

            // Handle Excel serial dates or "N/A"
            if (dob && dob !== "N/A") {
                if (typeof dob === 'number' || !isNaN(Number(dob))) {
                    const serialNum = Number(dob);
                    if (serialNum < 1000000) {
                        const excelEpoch = new Date(1899, 11, 30);
                        const millisecondsInDay = 24 * 60 * 60 * 1000;
                        dob = new Date(excelEpoch.getTime() + serialNum * millisecondsInDay);
                    }
                } else {
                    // Try parsing as string
                    let parsedDate = new Date(dob);
                    if (isNaN(parsedDate.getTime())) {
                        // Try DD/MM/YYYY format
                        const parts = String(dob).split(/[\/\-]/);
                        if (parts.length === 3) {
                            if (parts[0].length === 4) { // YYYY-MM-DD
                                parsedDate = new Date(parts[0], parts[1] - 1, parts[2]);
                            } else { // DD-MM-YYYY or MM-DD-YYYY
                                // Guessing DD/MM/YYYY
                                parsedDate = new Date(parts[2], parts[1] - 1, parts[0]);
                            }
                        }
                    }
                    
                    if (!isNaN(parsedDate.getTime())) {
                        dob = parsedDate;
                    } else {
                        dob = undefined;
                    }
                }
            } else {
                dob = undefined;
            }

            // Format phone numbers to +91 format, handle "N/A"
            const formatPhone = (phone) => {
                if (!phone || phone === "N/A") return undefined;
                let cleaned = String(phone).replace(/\D/g, '');
                if (cleaned.length === 10) return '+91' + cleaned;
                if (cleaned.length === 12 && cleaned.startsWith('91')) return '+' + cleaned;
                return phone;
            };

            emergencyContact = formatPhone(emergencyContact);
            parentPhone = formatPhone(parentPhone);

            // Handle Gender
            if (!gender || gender === "N/A") {
                gender = undefined; 
            } else {
                const g = gender.toLowerCase();
                if (g.startsWith('m')) gender = 'Male';
                else if (g.startsWith('f')) gender = 'Female';
            }

            // Clean up photoUrl if it's a local Windows path
            if (photoUrl && photoUrl !== "" && (photoUrl.includes('\\') || photoUrl.includes(':'))) {
                const parts = photoUrl.split(/[\\\/]/);
                const filename = parts[parts.length - 1];
                if (filename && filename !== "") {
                    photoUrl = `uploads\\${filename}`;
                }
            }

            // Handle Gender-based default photo if photoUrl is still missing or dummy
            if (!photoUrl || photoUrl === "" || photoUrl === "N/A") {
                if (gender === 'Male') {
                    photoUrl = 'uploads\\default-boy.png';
                } else if (gender === 'Female') {
                    photoUrl = 'uploads\\default-girl.png';
                }
            }

            // Normalize Student Type
            if (!studentType || studentType === "N/A") {
                studentType = 'Days Scholar';
            } else {
                const lowerType = String(studentType).toLowerCase();
                if (lowerType.includes('hostel')) studentType = 'Hosteller';
                else if (lowerType.includes('day') || lowerType.includes('scholar')) studentType = 'Days Scholar';
                else studentType = 'Days Scholar';
            }

            // Handle validUpto
            if (!validUpto || validUpto === "N/A") {
                const yearToValidUpto = {
                    'I': '2025-2029',
                    'II': '2024-2028',
                    'III': '2023-2027',
                    'IV': '2022-2026'
                };
                validUpto = yearToValidUpto[year] || '2024-2028';
            }

            const existingStudent = await Student.findOne({ registerNumber });
            
            const commonData = {
                name,
                department,
                year,
                email,
                officialEmail: (officialEmail && officialEmail !== "N/A") ? officialEmail : email,
                dob,
                bloodGroup: bloodGroup || "N/A",
                gender,
                photoUrl,
                address: address || "N/A",
                emergencyContact,
                parentPhone,
                studentType,
                validUpto,
                templateType: templateType === '3' ? '3' : '4',
                status: 'Approved',
                source: 'Bulk',
                approvalDate: Date.now()
            };

            if (existingStudent) {
                console.log(`Updating existing student: ${registerNumber}`);
                Object.assign(existingStudent, commonData);
                
                existingStudent.history.push({
                    status: 'Approved',
                    message: 'Student data updated via Bulk Sourcing',
                    updatedBy: 'Admin',
                    timestamp: Date.now()
                });
                
                await existingStudent.save();
                createdStudents.push(existingStudent);
            } else {
                console.log(`Creating new student: ${registerNumber}`);
                const student = await Student.create({
                    registerNumber,
                    ...commonData,
                    history: [{
                        status: 'Approved',
                        message: 'Student data imported via Bulk Sourcing',
                        updatedBy: 'Admin',
                        timestamp: Date.now()
                    }]
                });
                createdStudents.push(student);
            }
        } catch (error) {
            console.error(`Error processing student ${studentData.registerNumber}:`, error);
            errors.push({ registerNumber: studentData.registerNumber, error: error.message });
        }
    }

    res.status(201).json({
        message: `Successfully processed ${createdStudents.length} students`,
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
