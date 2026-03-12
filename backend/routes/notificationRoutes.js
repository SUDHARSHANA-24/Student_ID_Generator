import express from 'express';
import { getNotifications, markAsRead, markAllAsRead } from '../controllers/notificationController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

// Middleware inside the route to conditionally use 'protect' or 'student-auth' based on token,
// But to keep it simple, we can have separate protect middlewares or a unified one.
// Let's create a special middleware that accepts either student or admin token.

import jwt from 'jsonwebtoken';
import Admin from '../models/Admin.js';
import Student from '../models/Student.js';
import asyncHandler from 'express-async-handler';

const protectAny = asyncHandler(async (req, res, next) => {
    let token;

    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')
    ) {
        try {
            token = req.headers.authorization.split(' ')[1];
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            // Try to find admin first
            const adminUser = await Admin.findById(decoded.id).select('-password');
            if (adminUser) {
                req.admin = adminUser;
                return next();
            }

            // Try to find student
            const studentUser = await Student.findById(decoded.id).select('-password');
            if (studentUser) {
                req.student = studentUser;
                return next();
            }

            res.status(401);
            throw new Error('Not authorized, user not found');
        } catch (error) {
            console.error('Auth Any Middleware (Notifications) Error:', error.message);
            res.status(401);
            throw new Error(`Not authorized, token failed: ${error.message}`);
        }
    }

    if (!token) {
        res.status(401);
        throw new Error('Not authorized, no token');
    }
});

router.route('/').get(protectAny, getNotifications);
router.route('/read-all').put(protectAny, markAllAsRead);
router.route('/:id/read').put(protectAny, markAsRead);

export default router;
