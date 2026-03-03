import mongoose from 'mongoose';
import Admin from './models/Admin.js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '.env') });

async function resetAdminPassword() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const admin = await Admin.findOne({ username: 'admin' });

        if (admin) {
            admin.password = 'admin123';
            await admin.save();
            console.log('Successfully reset password for user: admin');
        } else {
            console.log('Admin user not found. Creating a new one...');
            await Admin.create({
                username: 'admin',
                password: 'admin123'
            });
            console.log('Successfully created new admin user: admin');
        }
        process.exit(0);
    } catch (e) {
        console.error('Error resetting/creating admin:', e);
        process.exit(1);
    }
}

resetAdminPassword();
