import mongoose from 'mongoose';
import path from 'path';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '.env') });

const studentSchema = new mongoose.Schema({
    registerNumber: String,
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

async function checkStudent() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const student = await Student.findOne({ registerNumber: '7376232CB156' });
        if (student) {
            console.log('Student found:', student.registerNumber);
            console.log('History:', JSON.stringify(student.history, null, 2));
            console.log('History type:', typeof student.history);
            console.log('History length:', student.history ? student.history.length : 'N/A');
        } else {
            console.log('Student not found');
        }
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

checkStudent();
