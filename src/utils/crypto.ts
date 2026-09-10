// Application-layer E2EE using Native Web Crypto API (SubtleCrypto)
// Zero external dependencies, pure standard crypto

const EMOJI_LIST = [
  '🦊', '🛡️', '⚡', '💎', '🔑', '🦅', '🦁', '🌟',
  '🔥', '🪐', '🐬', '🍀', '🎯', '🚀', '🔮', '🦄'
];

export interface EncryptedData {
  iv: string; // Base64
  ciphertext: string; // Base64
}

// Get standard Web Crypto API instance (browser or Node.js)
function getCrypto(): Crypto {
  if (typeof window !== 'undefined' && window.crypto) {
    return window.crypto;
  }
  if (typeof globalThis !== 'undefined' && globalThis.crypto) {
    return globalThis.crypto;
  }
  throw new Error('Web Crypto API is not supported in this environment');
}

// Convert Uint8Array to Base64
function arrayBufferToBase64(buffer: ArrayBuffer | Uint8Array): string {
  const bytes = buffer instanceof Uint8Array ? buffer : new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

// Convert Base64 to Uint8Array
function base64ToUint8Array(base64: string): Uint8Array {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

// Derive a strong 256-bit AES-GCM key from room secret and salt using PBKDF2
export async function deriveRoomKey(roomSecret: string, roomId: string): Promise<CryptoKey> {
  const crypto = getCrypto();
  const enc = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    enc.encode(roomSecret),
    'PBKDF2',
    false,
    ['deriveKey']
  );

  // Use roomId as deterministic salt
  const salt = enc.encode(`anonchat-salt-${roomId}`);

  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt,
      iterations: 100000,
      hash: 'SHA-256',
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
}

// Encrypt plaintext string to AES-GCM (Ciphertext + 12-byte IV)
export async function encryptText(plaintext: string, key: CryptoKey): Promise<EncryptedData> {
  const crypto = getCrypto();
  const enc = new TextEncoder();
  const iv = crypto.getRandomValues(new Uint8Array(12)); // 96-bit random IV for AES-GCM

  const encryptedBuffer = await crypto.subtle.encrypt(
    {
      name: 'AES-GCM',
      iv: iv as unknown as BufferSource,
    },
    key,
    enc.encode(plaintext) as unknown as BufferSource
  );

  return {
    iv: arrayBufferToBase64(iv),
    ciphertext: arrayBufferToBase64(encryptedBuffer),
  };
}

// Decrypt AES-GCM ciphertext back to plaintext string
export async function decryptText(encrypted: EncryptedData, key: CryptoKey): Promise<string> {
  const crypto = getCrypto();
  const dec = new TextDecoder();
  const iv = base64ToUint8Array(encrypted.iv);
  const ciphertext = base64ToUint8Array(encrypted.ciphertext);

  const decryptedBuffer = await crypto.subtle.decrypt(
    {
      name: 'AES-GCM',
      iv: iv as unknown as BufferSource,
    },
    key,
    ciphertext as unknown as BufferSource
  );

  return dec.decode(decryptedBuffer);
}

// Generate deterministic 6-digit Safety Number & 4 Emoji Fingerprint
// Cryptographically binds the actual derived AES-GCM key to prevent MITM and detect key mismatch
export async function generateSafetyFingerprint(
  key: CryptoKey,
  roomId: string
): Promise<{ digits: string; emojis: string[] }> {
  const crypto = getCrypto();
  const enc = new TextEncoder();

  // Encrypt a fixed verification challenge using the key with a zero-IV.
  // This produces a deterministic authentication tag uniquely tied to this specific key.
  const challenge = enc.encode(`ANONCHAT_SAFETY_VERIFICATION_VECTOR:${roomId}`);
  const zeroIv = new Uint8Array(12);

  const tagBuffer = await crypto.subtle.encrypt(
    {
      name: 'AES-GCM',
      iv: zeroIv,
    },
    key,
    challenge
  );

  // Hash the resulting key-bound ciphertext tag with SHA-256
  const hashBuffer = await crypto.subtle.digest('SHA-256', tagBuffer);
  const hashBytes = new Uint8Array(hashBuffer);

  // Generate 6-digit code: XXX XXX
  const num1 = ((hashBytes[0] << 8) | hashBytes[1]) % 1000;
  const num2 = ((hashBytes[2] << 8) | hashBytes[3]) % 1000;
  const digits = `${String(num1).padStart(3, '0')} ${String(num2).padStart(3, '0')}`;

  // Select 4 emojis
  const emojis = [
    EMOJI_LIST[hashBytes[4] % EMOJI_LIST.length],
    EMOJI_LIST[hashBytes[5] % EMOJI_LIST.length],
    EMOJI_LIST[hashBytes[6] % EMOJI_LIST.length],
    EMOJI_LIST[hashBytes[7] % EMOJI_LIST.length],
  ];

  return { digits, emojis };
}

// Generate random high-entropy room secret
export function generateRoomSecret(): string {
  const crypto = getCrypto();
  const array = new Uint8Array(16);
  crypto.getRandomValues(array);
  return Array.from(array, (byte) => byte.toString(16).padStart(2, '0')).join('');
}
