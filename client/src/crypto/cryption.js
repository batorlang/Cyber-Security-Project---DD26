//AES-GCM - Advanced Encryption Standard (Galois/Counter Mode) Algorithm
//Crypto API used for encryption/ decryption also for key generation.
//This is industry standard, but I can check out other options for manual algorithms if needed.

import crypto from "crypto";
import { Buffer } from "buffer";

const ALGORITHM = 'aes-256-gcm';
const KEY_LENGTH = 32;
const NONCE_LENGTH = 12;
const AUTH_TAG_LENGTH = 16;

function normalizeKey(key) {
    if(Buffer.isBuffer(key)) {
        if (key.length !== KEY_LENGTH) {
            throw new Error('Key Buffer must be 32 bytes.');
        }
        return key;
    }
    throw new Error('Key must be a Buffer or base64 string.');
}

/**
 * Schema match - ciphertext and AuthTag will be put together into one (base64) string.
*/
function packCiphertextAndTag(ciphertextBuf, authTagBuf) {
    return Buffer.concat([ciphertextBuf, authTagBuf]).toString('base64');
}

/**
 * Function to unpack Ciphertext and authentication tag from base64 string.
 * @packed holds the buffer of the sting 
 * @ciphertext holds the separated section of the base64 string
 * @authTag hold the rest of the buffer as authentication Tag
 * Returns both produced variables.
*/
function unpackCiphertextAndTag(packedBase64) {
    const packed = Buffer.from(packedBase64, 'base64');
    if (packed.length <= AUTH_TAG_LENGTH) {
        throw new Error('Invalid encrypted payload.');
    }
    const ciphertext = packed.subarray(0, packed.length - AUTH_TAG_LENGTH);
    const authTag = packed.subarray(packed.length - AUTH_TAG_LENGTH);
    return {ciphertext, authTag};
}
/**
 * Funtion to encrypt the Buffer
 * It normalizes the key with function, cerates cipher, then applies it to the buffer.
 * Returns the ciphertext, nonce and the algorithm. 
*/
function encryptBuffer(plainBuffer, key, aadBuffer){
    if (!Buffer.isBuffer(plainBuffer)){
        throw new Error('plainBuffer is not a Buffer!'); //Safety check for the buffer!
    }
    const k = normalizeKey(key);
    const nonce = crypto.randomBytes(NONCE_LENGTH);
    const cipher = crypto.createCipheriv(ALGORITHM, k, nonce,{
        authTagLength: AUTH_TAG_LENGTH
    });
    if (aadBuffer) {
        cipher.setAAD(aadBuffer);
    }
    const ciphertext = Buffer.concat([cipher.update(plainBuffer), cipher.final()]);
    const authTag = cipher.getAuthTag();
    return {
        ciphertext: packCiphertextAndTag(ciphertext, authTag),
        nonce: nonce.toString('base64'),
        algorithm: ALGORITHM
    };

}
/**
 * Funtion to decipher the Buffer
 * Return a concat. 
*/
function decryptBuffer(encrypted, key, aadBuffer) {
    if (!encrypted || typeof encrypted !== 'object') {
        throw new Error('Encrypted object is required. ');
    }
    if (encrypted.algorithm !== ALGORITHM) {
        throw new Error('Unsupported algorithm.');
    }
    const k = normalizeKey(key);
    const nonce = Buffer.from(encrypted.nonce, 'base64');
    const {ciphertext, authTag} = unpackCiphertextAndTag(encrypted.ciphertext);
    const decipher = crypto.createDecipheriv(ALGORITHM, k, nonce, {
        authTagLength: AUTH_TAG_LENGTH
    });
    if (aadBuffer) {
        decipher.setAAD(aadBuffer);
    }
    decipher.setAuthTag(authTag);
    return Buffer.concat([decipher.update(ciphertext), decipher.final()]);
}

function encryptText(plainText, key, aadText) {
    if (typeof plainText !== 'string') {
        throw new Error('plainText must be a string');
    }
    const aad = aadText ? Buffer.from(aadText, 'utf8') : undefined;
    return encryptBuffer(Buffer.from(plainText, 'utf8'), key, aad);
}

function decryptText(encrypted, key, aadText) {
    const aad = aadText ? Buffer.from(aadText, 'utf8'): undefined;
    const plain = decryptBuffer(encrypted, key, aad);
    return plain.toString('utf8');

}

export default {
    ALGORITHM,
    encryptBuffer,
    decryptBuffer,
    encryptText,
    decryptText
};
