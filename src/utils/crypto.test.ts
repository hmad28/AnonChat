import { describe, it, expect } from 'vitest';
import {
  deriveRoomKey,
  encryptText,
  decryptText,
  generateSafetyFingerprint,
  generateRoomSecret,
} from './crypto';

describe('WebCrypto E2EE Protocol', () => {
  const roomId = 'swift-fox-100';
  const secretA = 'master-secret-phrase-alpha';
  const secretB = 'master-secret-phrase-beta';

  it('should derive a valid AES-GCM 256-bit CryptoKey', async () => {
    const key = await deriveRoomKey(secretA, roomId);
    expect(key).toBeDefined();
    expect(key.algorithm.name).toBe('AES-GCM');
    expect((key.algorithm as AesKeyAlgorithm).length).toBe(256);
  });

  it('should successfully encrypt and decrypt plaintext messages', async () => {
    const key = await deriveRoomKey(secretA, roomId);
    const plaintext = 'TOP_SECRET: OPERATION_NIGHTFALL';

    const encrypted = await encryptText(plaintext, key);
    expect(encrypted.iv).toBeDefined();
    expect(encrypted.ciphertext).toBeDefined();
    expect(encrypted.ciphertext).not.toBe(plaintext);

    const decrypted = await decryptText(encrypted, key);
    expect(decrypted).toBe(plaintext);
  });

  it('should reject decryption when ciphertext or auth tag is tampered with', async () => {
    const key = await deriveRoomKey(secretA, roomId);
    const plaintext = 'INTEGRITY_CHECK_PAYLOAD';

    const encrypted = await encryptText(plaintext, key);

    // Tamper with the ciphertext base64 bytes
    const tampered = {
      ...encrypted,
      ciphertext: encrypted.ciphertext.substring(0, encrypted.ciphertext.length - 4) + 'AAAA',
    };

    await expect(decryptText(tampered, key)).rejects.toThrow();
  });

  it('should reject decryption when a wrong key is used', async () => {
    const keyCorrect = await deriveRoomKey(secretA, roomId);
    const keyWrong = await deriveRoomKey(secretB, roomId);

    const encrypted = await encryptText('SECRET_PAYLOAD', keyCorrect);
    await expect(decryptText(encrypted, keyWrong)).rejects.toThrow();
  });

  it('should produce identical Safety Fingerprints for identical keys and rooms', async () => {
    const key1 = await deriveRoomKey(secretA, roomId);
    const key2 = await deriveRoomKey(secretA, roomId);

    const fp1 = await generateSafetyFingerprint(key1, roomId);
    const fp2 = await generateSafetyFingerprint(key2, roomId);

    expect(fp1.digits).toBe(fp2.digits);
    expect(fp1.emojis).toEqual(fp2.emojis);
  });

  it('should produce DIFFERENT Safety Fingerprints when keys differ (Anti-MITM Verification)', async () => {
    const key1 = await deriveRoomKey(secretA, roomId);
    const key2 = await deriveRoomKey(secretB, roomId); // Different secret

    const fp1 = await generateSafetyFingerprint(key1, roomId);
    const fp2 = await generateSafetyFingerprint(key2, roomId);

    // Digits and/or emojis MUST be different because key is cryptographically bound
    const isDifferent = fp1.digits !== fp2.digits || JSON.stringify(fp1.emojis) !== JSON.stringify(fp2.emojis);
    expect(isDifferent).toBe(true);
  });

  it('should generate a 32-character random hex room secret', () => {
    const secret1 = generateRoomSecret();
    const secret2 = generateRoomSecret();

    expect(secret1).toHaveLength(32);
    expect(/^[0-9a-f]{32}$/.test(secret1)).toBe(true);
    expect(secret1).not.toBe(secret2);
  });
});
