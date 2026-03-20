import './env.js';
import mongoose from 'mongoose';
import Student from './models/Student.js';
import fs from 'fs';

async function checkStudent() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const nameQuery = process.argv[2] || 'PRABHANYA';
        const students = await Student.find({ name: new RegExp(nameQuery, 'i') });
        const output = {
            count: students.length,
            students: students
        };
        fs.writeFileSync('./student_debug.json', JSON.stringify(output, null, 2));
        console.log(`Report written to student_debug.json for ${nameQuery}`);
    } catch (err) {
        console.error(err);
    } finally {
        await mongoose.connection.close();
    }
}

checkStudent();
