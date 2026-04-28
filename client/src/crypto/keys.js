//WIP - Bator

import cryption from "./cryption";
import crypto from "crypto";
import { Buffer } from "buffer";

const KEY_LENGTH = 32;
const SALT_LENGTH = 16;
const PBKDF2_ITERATIONS = 210000;
const PBKDF2_DIGEST = 'sha256';

function generateMasterKey() {
    return crypto.randomBytes(KEY_LENGTH);
}
function generateConversationKey() {
    return crypto.randomBytes(KEY_LENGTH);
}
function generatePinSalt() {
    return crypto.randomBytes(SALT_LENGTH).toString('base64');
}
function derivePinKey(pin, pinSaltBase64) {
    if (typeof pin !== 'string' || pin.length !== 6) {
        throw new Error('PIN must be a string and 6 digits.');
    }
    if (typeof pinSaltBase64 !== 'string') {
        throw new Error('pinSaltBase64 must be a string.');
    }
    const salt = Buffer.from(pinSaltBase64, 'base64');
    return crypto.pbkdf2Sync(
        pin,
        salt,
        PBKDF2_ITERATIONS,
        KEY_LENGTH,
        PBKDF2_DIGEST
    );
}
//Registration
function createEncryptedMasterKeyForUser(pin) {
    const pinSalt = generatePinSalt();
    const masterKey = generateMasterKey();
    const pinKey = derivePinKey(pin, pinSalt);
    const encryptedMasterKey = cryption.encryptBuffer(masterKey, pinKey);
    return {pinSalt, encryptedMasterKey, masterKey};
}
//Login/unlock
function recoverMasterKeyFromUser(pin, pinSalt, encryptedMasterKey) {
    const pinKey = derivePinKey(pin, pinSalt);
    return cryption.decryptBuffer(encryptedMasterKey, pinKey);
}
function encryptConversationKeyForUser(conversationKey, userMasterKey) {
  return cryption.encryptBuffer(conversationKey, userMasterKey);
}

function decryptConversationKeyForUser(encryptedConversationKey, userMasterKey) {
  return cryption.decryptBuffer(encryptedConversationKey, userMasterKey);
}

// Encrypt message text with conversation key
// Optional AAD binds ciphertext to conversationId
function encryptMessageForStorage(plainText, conversationKey, conversationId) {
  const aad = conversationId ? String(conversationId) : undefined;
  return cryption.encryptText(plainText, conversationKey, aad);
}

// Decrypt message from message document fields
function decryptMessageFromStorage(messageDoc, conversationKey) {
  const aad = messageDoc.conversationId ? String(messageDoc.conversationId) : undefined;
    return cryption.decryptText(
    {
      ciphertext: messageDoc.ciphertext,
      nonce: messageDoc.nonce,
      algorithm: messageDoc.algorithm
    },
    conversationKey,
    aad
  );
}

// Generate shared conversation key deterministically based on both user ids
function deriveSharedConversationKey(uid1, uid2) {
    if (!uid1 || !uid2) {
        throw new Error('Both user IDs are required to derive shared key.');
    }
    const [id1, id2] = [String(uid1), String(uid2)].sort();
    return crypto.createHash('sha256').update(`${id1}:${id2}`).digest();
}



export default {
    PBKDF2_ITERATIONS,
    generateMasterKey,
    generateConversationKey,
    deriveSharedConversationKey,
    generatePinSalt,
    derivePinKey,
    createEncryptedMasterKeyForUser,
    recoverMasterKeyFromUser,
    encryptConversationKeyForUser,
    decryptConversationKeyForUser,
    encryptMessageForStorage,
    decryptMessageFromStorage
};
