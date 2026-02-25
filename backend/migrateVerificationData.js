import mongoose from 'mongoose';
import path from 'path';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '.env') });

const studentSchema = new mongoose.Schema({
    source: String,
    approvalDate: Date,
    status: String,
    createdAt: Date
});

const Student = mongoose.model('Student', studentSchema);

async function migrate() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to DB');

        const students = await Student.find({});
        console.log(`Found ${students.length} students to check.`);

        let updatedCount = 0;

        for (const student of students) {
            let changed = false;

            // Set source if missing
            if (!student.source) {
                student.source = 'Admin'; // Defaulting legacy records to Admin
                changed = true;
            }

            // Set approvalDate if Approved and missing
            if (student.status === 'Approved' && !student.approvalDate) {
                student.approvalDate = student.createdAt || Date.now();
                changed = true;
            }

            if (changed) {
                await student.save({ validateBeforeSave: false });
                updatedCount++;
            }
        }

        console.log(`Successfully updated ${updatedCount} students.`);
        process.exit(0);
    } catch (err) {
        console.error('Migration failed:', err);
        process.exit(1);
    }
}

migrate();
