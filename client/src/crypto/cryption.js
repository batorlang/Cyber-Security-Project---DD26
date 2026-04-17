//AES-GCM - Advanced Encryption Standard (Galois/Counter Mode) Algorithm
//Crypto API used for encryption/ decryption also for key generation.
//This is industry standard, but I can check out other options for manual algorithms if needed.

const encoder = new TextEncoder();
const decoder = new TextDecoder();

/**
 * Function to conver bytes into a base64 string, which helps storing data in JSON
 */
function bytesToBse64(bytes) {
    let binary = "";
    for (let i=0; i < bytes.length; i+=1) {
        binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary); //Binary to ASCII, so the binary conversion will end up returning a string
}
/**
 * Function to conver the base64 string back to bytes for usage.
 * @for loop is to go through the converted string and then one by one conver it to a byte (0 - 255), then fills up the bytes array.
 * @bytes is will be an array that holds reconverted data.
 */
function base64ToBytes(base64) {
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i=0; i < binary.length; i+=1) {
        bytes[i] = binary.charCodeAt(i);
    }
    return bytes;
} 
