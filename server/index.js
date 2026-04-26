const express = require('express');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(__dirname, '../.env') });

if (!process.env.JWT_SECRET) {
    console.error('Missing JWT_SECRET in .env at project root.');
    process.exit(1);
}

const User = require('./models/users');
const authMiddleware = require('./middleware/auth');
const { registerSchema, loginSchema, formatValidationError } = require('./utils/validation');
const userRouter = require('./routes/users');
const chatsRouter = require('./routes/chats');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/cyber-security')
.then(() => console.log('MongoDB connected'))
.catch(err => console.log('MongoDB connection error:', err));

// Helper function to generate JWT token
const generateToken = (userId, email, username) => {
    return jwt.sign(
        { userId, email, username },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRY || '7d' }
    );
};

// Routes
app.use('/api/auth', userRouter); //Register and login
app.use('/api/users', userRouter); // Get Users
app.use('/api/chats', chatsRouter); // Chat conversations and messages

// Test route
app.get('/', (req, res) => {
    res.send('Hello, world!');
});

// Register endpoint
app.post('/api/auth/register', async (req, res) => {
    try {
        const { username, email, password } = req.body;

        // Validate input using Zod schema
        try {
            registerSchema.parse({ username, email, password });
        } catch (validationError) {
            const errors = formatValidationError(validationError);
            return res.status(400).json({ 
                message: 'Validation failed', 
                errors 
            });
        }

        // Check if user already exists
        const existingUser = await User.findOne({ $or: [{ email }, { username }] });
        if (existingUser) {
            const field = existingUser.email === email ? 'email' : 'username';
            return res.status(400).json({ 
                message: 'User already exists',
                errors: { [field]: `${field} is already in use` }
            });
        }

        // Create new user
        const newUser = new User({
            username,
            email,
            password
        });

        // Save user (password will be hashed by pre-save hook)
        await newUser.save();

        // Generate JWT token
        const token = generateToken(newUser._id, newUser.email, newUser.username);

        // Return token and user data (without password)
        res.status(201).json({
            token,
            user: {
                id: newUser._id,
                username: newUser.username,
                email: newUser.email
            }
        });
    } catch (error) {
        console.error('Register error:', error);
        res.status(500).json({ message: 'Registration failed', error: error.message });
    }
});

// Login endpoint
app.post('/api/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Validate input using Zod schema
        try {
            loginSchema.parse({ email, password });
        } catch (validationError) {
            const errors = formatValidationError(validationError);
            return res.status(400).json({ 
                message: 'Validation failed', 
                errors 
            });
        }

        // Find user by email
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({ 
                message: 'Invalid email or password',
                errors: { email: 'User not found' }
            });
        }

        // Compare password
        const isPasswordValid = await user.comparePassword(password);
        if (!isPasswordValid) {
            return res.status(401).json({ 
                message: 'Invalid email or password',
                errors: { password: 'Incorrect password' }
            });
        }

        // Generate JWT token
        const token = generateToken(user._id, user.email, user.username);

        // Return token and user data (without password)
        res.json({
            token,
            user: {
                id: user._id,
                username: user.username,
                email: user.email
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Login failed', error: error.message });
    }
});

// Protected route example
app.get('/api/auth/me', authMiddleware, (req, res) => {
    res.json({ user: req.user });
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
