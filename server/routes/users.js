const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/users');
const authMiddleware = require('../middleware/auth');
const {
  registerSchema,
  loginSchema,
  formatValidationError,
} = require('../utils/validation');

const userRouter = express.Router();

// Helper to generate JWT token ( i dont know is this required since we have t in index.js)
const generateToken = (userId, email, username) => {
  return jwt.sign(
    { userId, email, username },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRY || '7d' }
  );
};

/**
 * POST /register
 * Register a user (password hash handled by User pre-save hook)
 */
userRouter.post('/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;

    try {
      registerSchema.parse({ username, email, password });
    } catch (validationError) {
      return res.status(400).json({
        message: 'Validation failed',
        errors: formatValidationError(validationError),
      });
    }

    const existingUser = await User.findOne({
      $or: [{ email }, { username }],
    });

    if (existingUser) {
      const field = existingUser.email === email ? 'email' : 'username';
      return res.status(403).json({
        message: 'User already exists',
        errors: { [field]: `${field} already in use` },
      });
    }

    const newUser = await User.create({
      username,
      email,
      password,
    });

    const token = generateToken(newUser._id, newUser.email, newUser.username);

    return res.status(201).json({
      token,
      user: {
        id: newUser._id,
        username: newUser.username,
        email: newUser.email,
      },
    });
  } catch (error) {
    console.error('Error during registration:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});

/**
 * POST /login
 * Login user and return JWT
 */
userRouter.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    try {
      loginSchema.parse({ email, password });
    } catch (validationError) {
      return res.status(400).json({
        message: 'Validation failed',
        errors: formatValidationError(validationError),
      });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found with that email.'});
    }

    const isValid = await user.comparePassword(password);
    if (!isValid) {
      return res.status(401).json({ message: 'Wrong password' });
    }

    const token = generateToken(user._id, user.email, user.username);

    return res.status(200).json({
      success: true,
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
      },
    });
  } catch (error) {
    console.error('Error during user login:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});

/**
 * GET /list
 * List users, excluding current user (for the profile listing)
 */
userRouter.get('/list', authMiddleware, async (req, res) => {
  try {
    const users = await User.find({
      _id: { $ne: req.user.userId },
    }).select('_id username email');

    return res.status(200).json(users);
  } catch (error) {
    console.error('Error fetching users list:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});

module.exports = userRouter;