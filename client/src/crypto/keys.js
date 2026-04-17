
/**
 *Function to generate AES-GCM keys, which can enrypt and decrypt text. (256 bits) 
 */
export async function generateKey() {
    return window.crypto.subtle.generateKey(
        {
            name: "AES-GCM",
            length: 256,
        },
        true, //This means it can be exported
        ["enrypt", "decrypt"]
    );
}