import mongoose from 'mongoose';
import path from 'path';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '.env') });

const studentSchema = new mongoose.Schema({
    templateType: String,
    studentType: String
});

const Student = mongoose.model('Student', studentSchema);

async function fixTemplates() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to DB');

        const students = await Student.find({ templateType: { $in: ['1', '2'] } });
        console.log(`Found ${students.length} students with legacy template IDs.`);

        let count = 0;
        for (const student of students) {
            if (student.studentType === 'Hosteller') {
                student.templateType = '3';
            } else {
                student.templateType = '4';
            }
            await student.save({ validateBeforeSave: false });
            count++;
        }

        console.log(`Fixed ${count} students.`);
        process.exit(0);
    } catch (err) {
        console.error('Failed to fix templates:', err);
        process.exit(1);
    }
}

fixTemplates();
