
const mongoose = require('mongoose');

const MessageSchema = new mongoose.Schema({
	conversationId: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'Conversation',
		required: true
	},
	senderId: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'User',
		required: true
	},
	ciphertext: {
		type: String,
		required: true
	},
	nonce: {
		type: String,
		required: true
	},
	algorithm: {
		type: String,
		required: true,
		default: 'aes-256-gcm'
	},
	messageType: {
		type: String,
		default: 'text'
	}
}, {
	timestamps: { createdAt: true, updatedAt: false }
});

MessageSchema.index({ conversationId: 1, createdAt: 1 });
MessageSchema.index({ senderId: 1 });

module.exports = mongoose.model('Message', MessageSchema);
