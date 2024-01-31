async function encrypt() {
    const inputText = document.getElementById('inputText').value;
    const customKey = document.getElementById('key').value;

    if (!validateKey(customKey)) {
        alert('Please enter a valid 32-byte key in hexadecimal format.');
        return;
    }

    // Convert the custom key to an ArrayBuffer
    const keyBuffer = hexStringToBuffer(customKey);

    // Import the key
    const key = await window.crypto.subtle.importKey(
        'raw',
        keyBuffer,
        { name: 'AES-GCM' },
        false,
        ['encrypt', 'decrypt']
    );

    // Convert the text to an ArrayBuffer
    const encoder = new TextEncoder();
    const plaintext = encoder.encode(inputText);

    // Encrypt the text using AES-GCM
    const ciphertext = await window.crypto.subtle.encrypt(
        { name: 'AES-GCM', iv: new Uint8Array(12) }, // IV should be unique for each encryption
        key,
        plaintext
    );

    // Convert the ciphertext to a base64-encoded string
    const encryptedText = btoa(String.fromCharCode(...new Uint8Array(ciphertext)));

    document.getElementById('outputText').value = encryptedText;
}

async function decrypt() {
    const encryptedText = document.getElementById('inputText').value;
    const customKey = document.getElementById('key').value;

    if (!validateKey(customKey)) {
        alert('Please enter a valid 32-byte key in hexadecimal format.');
        return;
    }

    // Convert the custom key to an ArrayBuffer
    const keyBuffer = hexStringToBuffer(customKey);

    // Import the key
    const key = await window.crypto.subtle.importKey(
        'raw',
        keyBuffer,
        { name: 'AES-GCM' },
        false,
        ['encrypt', 'decrypt']
    );

    // Convert the base64-encoded string to an ArrayBuffer
    const ciphertext = Uint8Array.from(atob(encryptedText), c => c.charCodeAt(0));

    // Decrypt the ciphertext using AES-GCM
    const decryptedText = await window.crypto.subtle.decrypt(
        { name: 'AES-GCM', iv: new Uint8Array(12) }, // IV should be the same as used for encryption
        key,
        ciphertext
    );

    // Convert the decrypted text to a string
    const decoder = new TextDecoder();
    const plaintext = decoder.decode(decryptedText);

    document.getElementById('outputText').value = plaintext;
}

function validateKey(key) {
    // Validate that the key is a 32-byte hexadecimal string
    return /^[0-9a-fA-F]{64}$/.test(key);
}

function hexStringToBuffer(hexString) {
    const buffer = new Uint8Array(hexString.match(/.{1,2}/g).map(byte => parseInt(byte, 16)));
    return buffer.buffer;
}


function copyToClipboard() {
    const outputText = document.getElementById('outputText');
    
    // Select the text in the outputText textarea
    outputText.select();
    outputText.setSelectionRange(0, 99999); // For mobile devices
    
    // Copy the selected text to the clipboard
    document.execCommand('copy');
    
    alert('Text copied to clipboard');
}

async function pasteFromClipboard() {
    const inputText = document.getElementById('inputText');

    // Request access to the clipboard
    try {
        const clipboardText = await navigator.clipboard.readText();
        inputText.value = clipboardText;
    } catch (err) {
        console.error('Unable to read from clipboard', err);
        alert('Unable to read from clipboard. Please paste manually.');
    }
}