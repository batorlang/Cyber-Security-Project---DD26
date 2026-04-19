
const mongoose = require('mongoose');

const ConversationSchema = new mongoose.Schema({
	type: {
		type: String,
		required: true,
		enum: ['direct', 'group'],
		default: 'direct'
	},
	name: {
		type: String,
		default: null,
		trim: true
	},
	createdBy: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'User',
		required: true
	},
	memberIds: [{
		type: mongoose.Schema.Types.ObjectId,
		ref: 'User',
		required: true
	}]
}, {
	timestamps: true
});

ConversationSchema.index({ memberIds: 1 });
ConversationSchema.index({ updatedAt: -1 });

module.exports = mongoose.model('Conversation', ConversationSchema);
