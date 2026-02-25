import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const studentSchema = mongoose.Schema({
    registerNumber: {
        type: String,
        required: true,
        unique: true,
        uppercase: true,
        trim: true
    },
    name: {
        type: String,
        required: true,
        uppercase: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    department: {
        type: String,
        required: true,
        uppercase: true,
        trim: true,
        enum: [
            'COMPUTER SCIENCE ENGINEERING',
            'COMPUTER SCIENCE AND BUSINESS SYSTEMS',
            'ARTIFICIAL INTELLIGENCE AND MACHINE LEARNING',
            'ARTIFICIAL INTELLIGENCE AND DATA SCIENCE',
            'COMPUTER TECHNOLOGY',
            'COMPUTER SCIENCE AND DESIGN'
        ]
    },
    year: {
        type: String,
        required: true,
        uppercase: true,
        trim: true,
        enum: ['I', 'II', 'III', 'IV']
    },
    // Optional fields for initial registration
    dob: {
        type: Date
    },
    bloodGroup: {
        type: String
    },
    gender: {
        type: String,
        enum: ['Male', 'Female']
    },
    photoUrl: {
        type: String
    },
    address: {
        type: String
    },
    emergencyContact: {
        type: String,
        match: [/^\+91[6-9]\d{9}$/, 'Student phone must start with +91 and be 10 digits starting with 6-9']
    },
    parentPhone: {
        type: String,
        match: [/^\+91[6-9]\d{9}$/, 'Parent phone must start with +91 and be 10 digits starting with 6-9']
    },
    officialEmail: {
        type: String
    },
    validUpto: {
        type: String
    },
    templateType: {
        type: String,
        enum: ['3', '4'],
        default: '4'
    },
    studentType: {
        type: String,
        enum: ['Days Scholar', 'Hosteller'],
        default: 'Days Scholar'
    },
    status: {
        type: String,
        enum: ['Registered', 'Pending', 'Approved', 'Rejected', 'Discontinued'],
        default: 'Registered'
    },
    rejectionReason: {
        type: String
    },
    source: {
        type: String,
        enum: ['Admin', 'Student', 'Bulk'],
        default: 'Admin'
    },
    approvalDate: {
        type: Date
    },
    history: [
        {
            status: String,
            message: String,
            updatedBy: String,
            timestamp: { type: Date, default: Date.now }
        }
    ]
}, {
    timestamps: true
});

const Student = mongoose.model('Student', studentSchema);

export default Student;
