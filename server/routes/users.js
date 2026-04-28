const express = require('express');
const User = require('../models/users');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// Get all users (except current user)
router.get('/', authMiddleware, async (req, res) => {
    try {
        const users = await User.find(
            { _id: { $ne: req.user.userId } },
            'username email _id' // Only return safe fields
        );
        res.json(users);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch users' });
    }
});

module.exports = router;
