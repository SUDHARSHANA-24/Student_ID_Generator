import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const studentSchema = mongoose.Schema({
    registerNumber: {
        type: String,
        required: true,
        unique: true
    },
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        unique: true,
        sparse: true
    },
    department: {
        type: String,
        required: true
    },
    year: {
        type: String,
        required: true
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
        type: String
    },
    parentPhone: {
        type: String
    },
    officialEmail: {
        type: String
    },
    validUpto: {
        type: String
    },
    templateType: {
        type: String,
        enum: ['1', '2'],
        default: '1'
    },
    studentType: {
        type: String,
        enum: ['Days Scholar', 'Hosteller'],
        default: 'Days Scholar'
    },
    status: {
        type: String,
        enum: ['Registered', 'Pending', 'Approved', 'Rejected'],
        default: 'Registered'
    },
    rejectionReason: {
        type: String
    }
}, {
    timestamps: true
});

const Student = mongoose.model('Student', studentSchema);

export default Student;
