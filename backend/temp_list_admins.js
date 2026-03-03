import mongoose from 'mongoose';
import Admin from './models/Admin.js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '.env') });

async function listAdmins() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const admins = await Admin.find({});
        console.log('Registered Admins:');
        admins.forEach(admin => {
            console.log(`- Username: ${admin.username}`);
        });
        if (admins.length === 0) {
            console.log('No admin accounts found in the database.');
        }
        process.exit(0);
    } catch (e) {
        console.error('Error connecting to database or fetching admins:', e);
        process.exit(1);
    }
}

listAdmins();
