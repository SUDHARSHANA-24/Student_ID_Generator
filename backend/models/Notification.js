import mongoose from 'mongoose';

const notificationSchema = mongoose.Schema(
    {
        userType: {
            type: String,
            required: true,
            enum: ['Admin', 'Student'],
        },
        recipient: {
            type: String, // 'admin' or student's registerNumber
            required: true,
        },
        message: {
            type: String,
            required: true,
        },
        isRead: {
            type: Boolean,
            default: false,
        },
    },
    {
        timestamps: true,
    }
);

const Notification = mongoose.models.Notification || mongoose.model('Notification', notificationSchema);

export default Notification;
