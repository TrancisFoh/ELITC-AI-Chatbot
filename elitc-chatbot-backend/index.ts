import express from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';

// Initialize Prisma and Express
const prisma = new PrismaClient();
const app = express();
const PORT = 3001;

// Middleware to parse JSON and allow frontend communication
app.use(cors());
app.use(express.json());

// A simple test route to make sure everything is working
app.get('/api/status', (req, res) => {
    res.json({
        message: 'Hello from your new Node.js backend!',
        database: 'SQLite is ready to go.'
    });
});

// Start the server
app.listen(PORT, () => {
    console.log(`🚀 Server is running on http://localhost:${PORT}`);
});