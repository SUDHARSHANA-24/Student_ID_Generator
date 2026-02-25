import mongoose from 'mongoose';
import path from 'path';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '.env') });

const studentSchema = new mongoose.Schema({
    studentType: String,
    templateType: String
});

const Student = mongoose.model('Student', studentSchema);

async function migrate() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to DB');

        const hostellers = await Student.updateMany(
            { studentType: 'Hosteller' },
            { $set: { templateType: '3' } }
        );
        console.log('Fixed Hostellers:', hostellers.modifiedCount);

        const daysScholars = await Student.updateMany(
            { studentType: 'Days Scholar' },
            { $set: { templateType: '4' } }
        );
        console.log('Fixed Days Scholars:', daysScholars.modifiedCount);

        process.exit(0);
    } catch (err) {
        console.error('Migration failed:', err);
        process.exit(1);
    }
}

migrate();
