import mongoose from 'mongoose';
import path from 'path';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '.env') });

const studentSchema = new mongoose.Schema({
    registerNumber: String,
    name: String,
    photoUrl: String
}, { timestamps: true });

const Student = mongoose.model('Student', studentSchema);

async function checkImages() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const students = await Student.find({}).sort({createdAt: -1}).limit(5);
        for (const student of students) {
            console.log(`Reg Number: ${student.registerNumber}, Name: ${student.name}, Photo URL: ${student.photoUrl}`);
        }
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

checkImages();
