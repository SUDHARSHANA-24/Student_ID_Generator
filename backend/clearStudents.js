import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import Student from './models/Student.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const clearStudents = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        const result = await Student.deleteMany({});
        console.log(`${result.deletedCount} students deleted.`);

        process.exit();
    } catch (error) {
        console.error('Error clearing students:', error);
        process.exit(1);
    }
};

clearStudents();
