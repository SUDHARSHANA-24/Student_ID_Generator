import express from 'express';
const router = express.Router();
import {
    createStudent,
    getStudents,
    getStudentProfile,
    updateStudentProfile,
    verifyStudent,
    bulkCreateStudents,
    verifyStudentPublic
} from '../controllers/studentController.js';
import { authStudent, registerStudent } from '../controllers/authController.js';
import { protect, protectStudent } from '../middleware/authMiddleware.js';
import { admin } from '../middleware/authMiddleware.js'; // Ensure admin middleware is imported if needed separately
import upload from '../middleware/uploadMiddleware.js';

/**
 * @swagger
 * /api/students:
 *   get:
 *     summary: Get all students with pagination
 *     tags: [Students]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: pageNumber
 *         schema:
 *           type: integer
 *         description: Page number
 *       - in: query
 *         name: keyword
 *         schema:
 *           type: string
 *         description: Search keyword (name or register number)
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *         description: Filter by status
 *     responses:
 *       200:
 *         description: List of students
 */
router.route('/')
    .post(protect, admin, upload.single('photo'), createStudent)
    .get(protect, admin, getStudents);

/**
 * @swagger
 * /api/students/{id}/verify:
 *   put:
 *     summary: Verify student status
 *     tags: [Students]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *               rejectionReason:
 *                 type: string
 *     responses:
 *       200:
 *         description: Student updated
 */
router.put('/:id/verify', protect, admin, verifyStudent);
router.post('/bulk', protect, admin, bulkCreateStudents);
router.get('/verify/:registerNumber', verifyStudentPublic); // Public verification route

// Student routes
router.post('/login', authStudent);
router.post('/signup', registerStudent);
router.route('/profile')
    .get(protectStudent, getStudentProfile)
    .put(protectStudent, upload.fields([
        { name: 'photo', maxCount: 1 }, 
        { name: 'aadhaarProof', maxCount: 1 }, 
        { name: 'birthCertProof', maxCount: 1 }, 
        { name: 'admissionProof', maxCount: 1 }
    ]), updateStudentProfile);

export default router;
