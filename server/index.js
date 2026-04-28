const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const http = require('http');
const { Server } = require('socket.io');

const authRoutes = require('./routes/auth');
const messagingRoutes = require('./routes/messaging');
const usersRoutes = require('./routes/users');
const conversationsRoutes = require('./routes/conversations');

dotenv.config({
    path: '../.env'
});

const app = express();
const PORT = process.env.PORT || 3000;
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: '*',
        methods: ['GET', 'POST']
    }
});

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/cyber-security')
.then(() => console.log('MongoDB connected'))
.catch(err => console.log('MongoDB connection error:', err));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/messages', messagingRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/conversations', conversationsRoutes);

io.on('connection', (socket) => {
    console.log(`Socket connected: ${socket.id}`);

    socket.on('join_conversation', (conversationId) => {
        socket.join(conversationId);
        console.log(`Socket ${socket.id} joined conversation: ${conversationId}`);
    });

    socket.on('send_message', (data) => {
        io.to(data.conversationId).emit('receive_message', data);
    });

    socket.on('disconnect', () => {
        console.log(`Socket disconnected: ${socket.id}`);
    });
});

server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
