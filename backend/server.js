import './env.js';
import express from 'express';
import fs from 'fs';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import connectDB from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import studentRoutes from './routes/studentRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Global Error Logging
process.on('uncaughtException', (err) => {
    const log = `[${new Date().toISOString()}] UNCAUGHT EXCEPTION: ${err.message}\nStack: ${err.stack}\n\n`;
    fs.appendFileSync(path.join(__dirname, 'server_error.log'), log);
    console.error(log);
    process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
    const log = `[${new Date().toISOString()}] UNHANDLED REJECTION: ${reason}\n\n`;
    fs.appendFileSync(path.join(__dirname, 'server_error.log'), log);
    console.error(log);
});

connectDB();

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/users', authRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/notifications', notificationRoutes);

// Make uploads folder static
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Serve frontend in production
if (process.env.NODE_ENV === 'production') {
    const frontendPath = path.join(__dirname, '../frontend/dist');
    app.use(express.static(frontendPath));

    app.get('*', (req, res) => {
        if (!req.path.startsWith('/api') && !req.path.startsWith('/uploads')) {
            res.sendFile(path.resolve(frontendPath, 'index.html'));
        }
    });
} else {
    app.get('/', (req, res) => {
        res.send('Student ID Generator API is running...');
    });
}

// Health Check
app.get('/health', (req, res) => res.status(200).json({ status: 'ok' }));

// Error Handling Middleware
app.use((err, req, res, next) => {
    const statusCode = err.statusCode || (res.statusCode === 200 ? 500 : res.statusCode);
    const logMessage = `[${new Date().toISOString()}] ${req.method} ${req.path} - Status ${statusCode} - Error: ${err.message}\n` +
        `Headers: ${JSON.stringify(req.headers, null, 2)}\n` +
        `Body: ${JSON.stringify(req.body, null, 2)}\n` +
        `Stack: ${err.stack}\n\n`;
    try {
        fs.appendFileSync(path.join(__dirname, 'server_error.log'), logMessage);
    } catch (e) {
        console.error('Failed to write to log file', e);
    }
    console.error(logMessage);
    
    res.status(statusCode).json({
        message: err.message || 'Internal Server Error',
        stack: process.env.NODE_ENV === 'production' ? null : err.stack,
    });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
