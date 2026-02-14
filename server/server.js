import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer } from 'http';
import { Server as SocketIO } from 'socket.io';
import { db } from './config/firebase.js';

// Route imports
import authRoutes from './routes/authRoutes.js';
import listingRoutes from './routes/listingRoutes.js';
import serviceRoutes from './routes/serviceRoutes.js';
import userRoutes from './routes/userRoutes.js';
import messageRoutes from './routes/messageRoutes.js';
import reviewRoutes from './routes/reviewRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import reportRoutes from './routes/reportRoutes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load env vars
dotenv.config();

const app = express();
const httpServer = createServer(app);

// --------------- Socket.io ---------------

const io = new SocketIO(httpServer, {
    cors: {
        origin: process.env.CLIENT_URL || 'http://localhost:5173',
        credentials: true,
    },
});

// Track online users
const onlineUsers = new Map();

io.on('connection', (socket) => {
    console.log(`🔌 Socket connected: ${socket.id}`);

    // User comes online
    socket.on('user_online', (userId) => {
        onlineUsers.set(userId, socket.id);
        socket.userId = userId;
        io.emit('users_online', Array.from(onlineUsers.keys()));
    });

    // Join a conversation room
    socket.on('join_conversation', (conversationId) => {
        socket.join(conversationId);
    });

    // Leave a conversation room
    socket.on('leave_conversation', (conversationId) => {
        socket.leave(conversationId);
    });

    // New message — broadcast to conversation room
    socket.on('send_message', (data) => {
        socket.to(data.conversationId).emit('new_message', data);
    });

    // Typing indicator
    socket.on('typing', (data) => {
        socket.to(data.conversationId).emit('user_typing', data);
    });

    socket.on('stop_typing', (data) => {
        socket.to(data.conversationId).emit('user_stop_typing', data);
    });

    // Disconnect
    socket.on('disconnect', () => {
        if (socket.userId) {
            onlineUsers.delete(socket.userId);
            io.emit('users_online', Array.from(onlineUsers.keys()));
        }
        console.log(`🔌 Socket disconnected: ${socket.id}`);
    });
});

// Make io accessible to routes
app.set('io', io);

// --------------- Middleware ---------------

// Security headers (allow cross-origin images)
app.use(
    helmet({
        crossOriginResourcePolicy: { policy: 'cross-origin' },
        contentSecurityPolicy: false,
    })
);

// CORS
app.use(
    cors({
        origin: process.env.CLIENT_URL || 'http://localhost:5173',
        credentials: true,
    })
);

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100,
    message: { success: false, message: 'Too many requests, please try again later' },
});
app.use('/api', limiter);

// Body parser
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Cookie parser
app.use(cookieParser());

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// --------------- Routes ---------------

app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/listings', listingRoutes);
app.use('/api/v1/services', serviceRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/messages', messageRoutes);
app.use('/api/v1', reviewRoutes);
app.use('/api/v1/admin', adminRoutes);
app.use('/api/v1/notifications', notificationRoutes);
app.use('/api/v1/reports', reportRoutes);

// Health check
app.get('/api/health', (req, res) => {
    res.status(200).json({ success: true, message: 'CampusSwap API is running 🚀' });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({ success: false, message: 'Route not found' });
});

// Global error handler
app.use((err, req, res, next) => {
    console.error('Server Error:', err);
    res.status(500).json({ success: false, message: 'Internal server error' });
});

// --------------- Start Server ---------------

const PORT = process.env.PORT || 5000;

httpServer.listen(PORT, () => {
    console.log(`🚀 CampusSwap API running on port ${PORT} (${process.env.NODE_ENV})`);
    console.log(`🔌 Socket.io ready for real-time connections`);
});
