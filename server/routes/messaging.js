const express = require('express');
const Message = require('../models/messages');
const Conversation = require('../models/conversations');
const authMiddleware = require('../middleware/auth');
const router = express.Router();

// Get conversation messages
router.get('/:conversationId/messages', authMiddleware, async (req, res) => {
    try {
        const { conversationId } = req.params;
        const messages = await Message.find({ conversationId }).sort({ createdAt: 1 });
        res.json(messages);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch messages' });
    }
});

// Create new encrypted message
router.post('/:conversationId/messages', authMiddleware, async (req, res) => {
    try {
        const { conversationId } = req.params;
        const { ciphertext, nonce, algorithm, messageType } = req.body;
        
        // Enforce that only encrypted text is stored in the DB (keys stay on client!)
        const newMessage = new Message({
            conversationId,
            senderId: req.user.userId,
            ciphertext,
            nonce,
            algorithm,
            messageType: messageType || 'text'
        });
        
        await newMessage.save();
        res.status(201).json(newMessage);
    } catch (err) {
        res.status(500).json({ error: 'Failed to save message', details: err });
    }
});

module.exports = router;
