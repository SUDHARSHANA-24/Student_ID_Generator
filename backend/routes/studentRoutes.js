import express from 'express';
const router = express.Router();
import {
    createStudent,
    getStudents,
    getStudentProfile,
    updateStudentProfile,
    verifyStudent,
    bulkCreateStudents
} from '../controllers/studentController.js';
import { authStudent, registerStudent } from '../controllers/authController.js';
import { protect, protectStudent } from '../middleware/authMiddleware.js';
import { admin } from '../middleware/authMiddleware.js'; // Ensure admin middleware is imported if needed separately
import upload from '../middleware/uploadMiddleware.js';

// Admin routes
router.route('/')
    .post(protect, admin, upload.single('photo'), createStudent)
    .get(protect, admin, getStudents);

router.put('/:id/verify', protect, admin, verifyStudent);
router.post('/bulk', protect, admin, bulkCreateStudents);

// Student routes
router.post('/login', authStudent);
router.post('/signup', registerStudent);
router.route('/profile')
    .get(protectStudent, getStudentProfile)
    .put(protectStudent, upload.single('photo'), updateStudentProfile);

export default router;
