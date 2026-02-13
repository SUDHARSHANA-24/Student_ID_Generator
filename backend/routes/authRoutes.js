import express from 'express';
const router = express.Router();
import { authAdmin, registerAdmin, authStudent } from '../controllers/authController.js';

router.post('/login', authAdmin);
router.post('/register', registerAdmin); // Setup route
router.post('/student/login', authStudent);

export default router;
