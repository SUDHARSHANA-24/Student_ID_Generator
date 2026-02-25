import mongoose from 'mongoose';
import path from 'path';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '.env') });

const studentSchema = new mongoose.Schema({
    emergencyContact: String,
    parentPhone: String,
    registerNumber: String
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

            // Fix Student Phone (emergencyContact)
            if (student.emergencyContact) {
                let phone = student.emergencyContact.replace(/\D/g, '');
                if (phone.length === 10) {
                    student.emergencyContact = '+91' + phone;
                    changed = true;
                } else if (phone.length === 11 && phone.startsWith('0')) {
                    student.emergencyContact = '+91' + phone.slice(1);
                    changed = true;
                } else if (phone.length === 12 && phone.startsWith('91')) {
                    student.emergencyContact = '+' + phone;
                    changed = true;
                }
            }

            // Fix Parent Phone
            if (student.parentPhone) {
                let phone = student.parentPhone.replace(/\D/g, '');
                if (phone.length === 10) {
                    student.parentPhone = '+91' + phone;
                    changed = true;
                } else if (phone.length === 11 && phone.startsWith('0')) {
                    student.parentPhone = '+91' + phone.slice(1);
                    changed = true;
                } else if (phone.length === 12 && phone.startsWith('91')) {
                    student.parentPhone = '+' + phone;
                    changed = true;
                }
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
