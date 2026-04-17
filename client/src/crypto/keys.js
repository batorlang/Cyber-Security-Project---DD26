//WIP - Bator

const crypto = require('crypto');
const cryption = require('./cryption');

const KEY_LENGTH = 32;
const SALT_LENGTH = 16;
const PBKDF2_ITERATIONS = 210000;
const PBKDF2_DIGEST = 'sha256';




module.export = {
    PBKDF2_ITERATIONS,
    generateMasterKey,
    generateConversationKey,
    generatePinSalt,
    derivePinKey,
    createEncryptedMasterKeyForUser,
    recoverMasterKeyFromUser,
    encryptConversationKeyForUser,
    decryptConversationKeyForUser,
    encryptMessageForStorage,
    decryptMessageFromStorage
};
