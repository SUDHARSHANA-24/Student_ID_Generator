import mongoose from 'mongoose';
import path from 'path';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '.env') });

const studentSchema = new mongoose.Schema({
    registerNumber: String,
    status: String,
    source: String,
    approvalDate: Date,
    createdAt: Date,
    history: [
        {
            status: String,
            message: String,
            updatedBy: String,
            timestamp: { type: Date, default: Date.now }
        }
    ]
}, { timestamps: true });

const Student = mongoose.model('Student', studentSchema);

async function backfillHistory() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to DB');

        const students = await Student.find({ $or: [{ history: { $exists: false } }, { history: { $size: 0 } }] });
        console.log(`Found ${students.length} students with missing/empty history.`);

        let updatedCount = 0;
        for (const student of students) {
            const history = [];

            // 1. Initial Registration/Creation
            if (student.source === 'Bulk') {
                history.push({
                    status: 'Approved',
                    message: 'Student data imported via Bulk Sourcing',
                    updatedBy: 'Admin',
                    timestamp: student.createdAt || Date.now()
                });
            } else if (student.source === 'Admin') {
                history.push({
                    status: 'Approved',
                    message: 'Account created and approved by Admin',
                    updatedBy: 'Admin',
                    timestamp: student.createdAt || Date.now()
                });
            } else if (student.source === 'Student') {
                history.push({
                    status: 'Registered',
                    message: 'Student account created',
                    updatedBy: 'Student',
                    timestamp: student.createdAt || Date.now()
                });

                // If status is Pending, Approved or Rejected, it means they also updated their profile
                if (['Pending', 'Approved', 'Rejected'].includes(student.status)) {
                    history.push({
                        status: 'Pending',
                        message: 'Student updated profile details',
                        updatedBy: 'Student',
                        timestamp: student.createdAt || Date.now() // Close enough to registration for legacy records
                    });
                }
            }

            // 2. Final Approval/Rejection for Student-led records
            if (student.source === 'Student' && student.status === 'Approved') {
                history.push({
                    status: 'Approved',
                    message: 'Admin approved application',
                    updatedBy: 'Admin',
                    timestamp: student.approvalDate || Date.now()
                });
            } else if (student.source === 'Student' && student.status === 'Rejected') {
                history.push({
                    status: 'Rejected',
                    message: 'Admin rejected application',
                    updatedBy: 'Admin',
                    timestamp: student.updatedAt || Date.now()
                });
            }

            student.history = history;
            await student.save({ validateBeforeSave: false });
            updatedCount++;
        }

        console.log(`Successfully backfilled history for ${updatedCount} students.`);
        process.exit(0);
    } catch (err) {
        console.error('Migration failed:', err);
        process.exit(1);
    }
}

backfillHistory();
