const express = require('express');
const Conversation = require('../models/conversations');
const ConversationKey = require('../models/conversationKeys');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// Get user's conversations
router.get('/', authMiddleware, async (req, res) => {
    try {
        const conversations = await Conversation.find({ memberIds: req.user.userId })
            .populate('memberIds', 'username email');
            
        // Get keys for these conversations
        const conversationIds = conversations.map(c => c._id);
        const keys = await ConversationKey.find({
            userId: req.user.userId,
            conversationId: { $in: conversationIds }
        });

        res.json({ conversations, keys });
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch conversations' });
    }
});

// Create conversation
router.post('/', authMiddleware, async (req, res) => {
    try {
        const { targetUserId, myEncryptedKey, theirEncryptedKey } = req.body;
        

        // Find existing direct conversation
        let conversation = await Conversation.findOne({
            type: 'direct',
            memberIds: { $all: [req.user.userId, targetUserId] }
        });
        
        let isNew = false;
        
        if (!conversation) {
            conversation = new Conversation({
                type: 'direct',
                createdBy: req.user.userId,
                memberIds: [req.user.userId, targetUserId]
            });
            await conversation.save();
            isNew = true;
            
            // Save keys
            const keyMe = new ConversationKey({
                conversationId: conversation._id,
                userId: req.user.userId,
                encryptedConversationKey: myEncryptedKey
            });
            await keyMe.save();

            // Since it is E2EE and we lack async key pairs in current keys.js
            // we will let the clients do a mock key trade or use a DH scheme in real life
            if (theirEncryptedKey) {
                 const keyThem = new ConversationKey({
                     conversationId: conversation._id,
                     userId: targetUserId,
                     encryptedConversationKey: theirEncryptedKey
                 });
                 await keyThem.save();
            }
        }
        
        const myKey = await ConversationKey.findOne({
            conversationId: conversation._id,
            userId: req.user.userId
        });
        
        res.json({ conversation, myKey, isNew });
    } catch (err) {
        res.status(500).json({ error: 'Failed to create/fetch conversation', details: err });
    }
});

module.exports = router;
