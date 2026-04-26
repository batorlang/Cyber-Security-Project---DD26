const express = require('express');
const mongoose = require('mongoose');
const authMiddleware = require('../middleware/auth');
const Conversation = require('../models/conversations');
const Message = require('../models/messages');
const { messageSchema, formatValidationError } = require('../utils/validation');

const chatsRouter = express.Router();

const isValidObjectId = (value) => mongoose.Types.ObjectId.isValid(value);

const ensureConversationMember = async (conversationId, userId) => {
	const conversation = await Conversation.findById(conversationId).select('_id memberIds');
	if (!conversation) {
		return { error: { status: 404, message: 'Conversation not found' } };
	}

	const isMember = conversation.memberIds.some((id) => String(id) === String(userId));
	if (!isMember) {
		return { error: { status: 403, message: 'You are not a member of this conversation' } };
	}

	return { conversation };
};

/**
 * POST /conversations/direct
 * Create a direct conversation with another user, or return existing one.
 */
chatsRouter.post('/conversations/direct', authMiddleware, async (req, res) => {
	try {
		const senderId = req.user.userId;
		const { receiverId } = req.body;

		if (!receiverId || !isValidObjectId(receiverId)) {
			return res.status(400).json({
				message: 'Validation failed',
				errors: { receiverId: 'Valid receiverId is required' },
			});
		}

		if (String(senderId) === String(receiverId)) {
			return res.status(400).json({
				message: 'Validation failed',
				errors: { receiverId: 'Cannot create a conversation with yourself' },
			});
		}

		let conversation = await Conversation.findOne({
			type: 'direct',
			memberIds: { $all: [senderId, receiverId], $size: 2 },
		});

		if (!conversation) {
			conversation = await Conversation.create({
				type: 'direct',
				createdBy: senderId,
				memberIds: [senderId, receiverId],
			});
		}

		return res.status(200).json({
			conversationId: conversation._id,
			memberIds: conversation.memberIds,
			createdAt: conversation.createdAt,
		});
	} catch (error) {
		console.error('Error creating direct conversation:', error);
		return res.status(500).json({ error: 'Internal Server Error' });
	}
});

/**
 * GET /conversations/:conversationId/messages
 * Fetch conversation messages (latest first), with optional cursor pagination.
 */
chatsRouter.get('/conversations/:conversationId/messages', authMiddleware, async (req, res) => {
	try {
		const { conversationId } = req.params;
		const { limit, before } = req.query;

		if (!isValidObjectId(conversationId)) {
			return res.status(400).json({
				message: 'Validation failed',
				errors: { conversationId: 'Invalid conversationId' },
			});
		}

		const membership = await ensureConversationMember(conversationId, req.user.userId);
		if (membership.error) {
			return res.status(membership.error.status).json({ message: membership.error.message });
		}

		const parsedLimit = Number(limit);
		const safeLimit = Number.isFinite(parsedLimit)
			? Math.min(Math.max(parsedLimit, 1), 100)
			: 50;

		const query = { conversationId };
		if (before) {
			const beforeDate = new Date(before);
			if (!Number.isNaN(beforeDate.getTime())) {
				query.createdAt = { $lt: beforeDate };
			}
		}

		const messages = await Message.find(query)
			.sort({ createdAt: -1 })
			.limit(safeLimit)
			.select('_id senderId ciphertext nonce algorithm messageType createdAt');

		return res.status(200).json(messages);
	} catch (error) {
		console.error('Error fetching messages:', error);
		return res.status(500).json({ error: 'Internal Server Error' });
	}
});

/**
 * POST /conversations/:conversationId/messages
 * Send a message into a conversation.
 */
chatsRouter.post('/conversations/:conversationId/messages', authMiddleware, async (req, res) => {
	try {
		const { conversationId } = req.params;
		const { ciphertext, nonce, algorithm, messageType = 'text', content } = req.body;

		if (!isValidObjectId(conversationId)) {
			return res.status(400).json({
				message: 'Validation failed',
				errors: { conversationId: 'Invalid conversationId' },
			});
		}

		if (typeof content === 'string') {
			try {
				messageSchema.parse({ content });
			} catch (validationError) {
				return res.status(400).json({
					message: 'Validation failed',
					errors: formatValidationError(validationError),
				});
			}
		}

		if (!ciphertext || !nonce || !algorithm) {
			return res.status(400).json({
				message: 'Validation failed',
				errors: {
					ciphertext: 'ciphertext is required',
					nonce: 'nonce is required',
					algorithm: 'algorithm is required',
				},
			});
		}

		const membership = await ensureConversationMember(conversationId, req.user.userId);
		if (membership.error) {
			return res.status(membership.error.status).json({ message: membership.error.message });
		}

		const message = await Message.create({
			conversationId,
			senderId: req.user.userId,
			ciphertext,
			nonce,
			algorithm,
			messageType,
		});

		await Conversation.findByIdAndUpdate(conversationId, {
			$set: { updatedAt: new Date() },
		});

		return res.status(201).json({
			_id: message._id,
			conversationId: message.conversationId,
			senderId: message.senderId,
			ciphertext: message.ciphertext,
			nonce: message.nonce,
			algorithm: message.algorithm,
			messageType: message.messageType,
			createdAt: message.createdAt,
		});
	} catch (error) {
		console.error('Error sending message:', error);
		return res.status(500).json({ error: 'Internal Server Error' });
	}
});

module.exports = chatsRouter;
