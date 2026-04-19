
const mongoose = require('mongoose');

const EncryptedMasterKeySchema = new mongoose.Schema({
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

const UserSchema = new mongoose.Schema({
	username: {
		type: String,
		required: true,
		unique: true,
		trim: true
	},
	email: {
		type: String,
		required: true,
		unique: true,
		trim: true,
		lowercase: true
	},
	passwordHash: {
		type: String,
		required: true
	},
	pinSalt: {
		type: String,
		required: true
	},
	encryptedMasterKey: {
		type: EncryptedMasterKeySchema,
		required: true
	}
}, {
	timestamps: true
});

UserSchema.index({ username: 1 }, { unique: true });
UserSchema.index({ email: 1 }, { unique: true });

module.exports = mongoose.model('User', UserSchema);
