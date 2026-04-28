const express = require('express');
const User = require('../models/users');
const jwt = require('jsonwebtoken');
const { registerSchema, loginSchema, formatValidationError } = require('../utils/validation');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

const generateToken = (userId, email, username) => {
    return jwt.sign(
        { userId, email, username },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRY || '7d' }
    );
};

router.post('/register', async (req, res) => {
    try {
        const { username, email, password, pinSalt, encryptedMasterKey } = req.body;

        try {
            registerSchema.parse({ username, email, password });
        } catch (validationError) {
            const errors = formatValidationError(validationError);
            return res.status(400).json({ message: 'Validation failed', errors });
        }

        const existingUser = await User.findOne({ $or: [{ email }, { username }] });
        if (existingUser) {
            const field = existingUser.email === email ? 'email' : 'username';
            return res.status(400).json({ 
                message: 'User already exists',
                errors: { [field]: `${field} is already in use` }
            });
        }

        const newUser = new User({
            username,
            email,
            password,
            pinSalt,
            encryptedMasterKey
        });

        await newUser.save();

        const token = generateToken(newUser._id, newUser.email, newUser.username);

        res.status(201).json({
            token,
            user: {
                id: newUser._id,
                username: newUser.username,
                email: newUser.email,
                pinSalt: newUser.pinSalt,
                encryptedMasterKey: newUser.encryptedMasterKey
            }
        });
    } catch (error) {
        console.error('Register error:', error);
        res.status(500).json({ message: 'Registration failed', error: error.message });
    }
});

router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        try {
            loginSchema.parse({ email, password });
        } catch (validationError) {
            const errors = formatValidationError(validationError);
            return res.status(400).json({ message: 'Validation failed', errors });
        }

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({ 
                message: 'Invalid email or password',
                errors: { email: 'User not found' }
            });
        }

        const isPasswordValid = await user.comparePassword(password);
        if (!isPasswordValid) {
            return res.status(401).json({ 
                message: 'Invalid email or password',
                errors: { password: 'Incorrect password' }
            });
        }

        const token = generateToken(user._id, user.email, user.username);

        res.json({
            token,
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                pinSalt: user.pinSalt,
                encryptedMasterKey: user.encryptedMasterKey
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Login failed', error: error.message });
    }
});

router.get('/me', authMiddleware, (req, res) => {
    res.json({ user: req.user });
});

module.exports = router;
