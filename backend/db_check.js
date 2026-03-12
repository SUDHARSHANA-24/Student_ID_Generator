import './env.js';
import mongoose from 'mongoose';
import Student from './models/Student.js';

async function check() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const student = await Student.findOne();
        console.log(`|${student.registerNumber}|`);
        console.log(`|${student.name}|`);
        process.exit(0);
    } catch (e) {
        console.error('Check failed:', e);
        process.exit(1);
    }
}
check();
