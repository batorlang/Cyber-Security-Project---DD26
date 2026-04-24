
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

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
	password: {
		type: String,
		required: true
	},
	passwordHash: {
		type: String
	},
	pinSalt: {
		type: String
	},
	encryptedMasterKey: {
		type: EncryptedMasterKeySchema
	}
}, {
	timestamps: true
});

// Hash password before saving
UserSchema.pre('save', async function() {
	if (!this.isModified('password')) {
		return;
	}
	const salt = await bcrypt.genSalt(10);
	const hashedPassword = await bcrypt.hash(this.password, salt);
	this.password = hashedPassword;
});

// Method to compare password with hashed password
UserSchema.methods.comparePassword = async function(enteredPassword) {
	return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', UserSchema);
