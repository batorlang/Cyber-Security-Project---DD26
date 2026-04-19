const mongoose = require('mongoose');

const EncryptedConversationKeySchema = new mongoose.Schema({
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
	}
}, { _id: false });

const ConversationKeySchema = new mongoose.Schema({
	conversationId: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'Conversation',
		required: true
	},
	userId: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'User',
		required: true
	},
	encryptedConversationKey: {
		type: EncryptedConversationKeySchema,
		required: true
	},
	createdAt: {
		type: Date,
		default: Date.now
	}
});

ConversationKeySchema.index({ conversationId: 1, userId: 1 }, { unique: true });
ConversationKeySchema.index({ userId: 1 });

module.exports = mongoose.model('ConversationKey', ConversationKeySchema);
