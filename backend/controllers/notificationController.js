import asyncHandler from 'express-async-handler';
import Notification from '../models/Notification.js';

// @desc    Get notifications for user
// @route   GET /api/notifications
// @access  Private
const getNotifications = asyncHandler(async (req, res) => {
    let recipient;
    if (req.admin) {
        // Admin
        recipient = 'admin';
    } else if (req.student) {
        // Student
        recipient = req.student.registerNumber;
    } else {
        res.status(401);
        throw new Error('Not authorized');
    }

    const notifications = await Notification.find({ recipient }).sort({ createdAt: -1 });
    res.json(notifications);
});

// @desc    Mark notification as read
// @route   PUT /api/notifications/:id/read
// @access  Private
const markAsRead = asyncHandler(async (req, res) => {
    const notification = await Notification.findById(req.params.id);

    if (notification) {
        notification.isRead = true;
        const updatedNotification = await notification.save();
        res.json(updatedNotification);
    } else {
        res.status(404);
        throw new Error('Notification not found');
    }
});

// @desc    Mark all as read
// @route   PUT /api/notifications/read-all
// @access  Private
const markAllAsRead = asyncHandler(async (req, res) => {
    let recipient;
    if (req.admin) {
        recipient = 'admin';
    } else if (req.student) {
        recipient = req.student.registerNumber;
    } else {
        res.status(401);
        throw new Error('Not authorized');
    }

    await Notification.updateMany({ recipient, isRead: false }, { isRead: true });
    res.json({ message: 'All notifications marked as read' });
});

export { getNotifications, markAsRead, markAllAsRead };
