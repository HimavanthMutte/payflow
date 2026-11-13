import {
  hashPassword,
  verifyPassword,
  hashPin,
  verifyPin,
  generateReferenceNumber,
  generateIdempotencyKey,
  hashToken,
  hashRequest,
  generateSecureToken,
} from '../../src/utils/crypto.util';

describe('Crypto & Security Utilities', () => {
  describe('Password Hashing (Argon2id)', () => {
    it('should hash a password and successfully verify it', async () => {
      const password = 'SuperSecretPassword@123';
      const hash = await hashPassword(password);

      expect(hash).toBeDefined();
      expect(hash.startsWith('$argon2id$')).toBe(true);

      const isValid = await verifyPassword(password, hash);
      expect(isValid).toBe(true);

      const isInvalid = await verifyPassword('WrongPassword', hash);
      expect(isInvalid).toBe(false);
    });
  });

  describe('PIN Hashing (Argon2id)', () => {
    it('should hash a 6-digit PIN and verify it correctly', async () => {
      const pin = '482619';
      const hash = await hashPin(pin);

      expect(hash).toBeDefined();
      expect(hash.startsWith('$argon2id$')).toBe(true);

      const isValid = await verifyPin(pin, hash);
      expect(isValid).toBe(true);

      const isInvalid = await verifyPin('123456', hash);
      expect(isInvalid).toBe(false);
    });
  });

  describe('Reference Number Generation', () => {
    it('should generate reference numbers starting with PF', () => {
      const ref1 = generateReferenceNumber();
      const ref2 = generateReferenceNumber();

      expect(ref1.startsWith('PF')).toBe(true);
      expect(ref2.startsWith('PF')).toBe(true);
      expect(ref1).not.toBe(ref2);
    });
  });

  describe('Idempotency Key Generation', () => {
    it('should generate valid UUID v4 format keys', () => {
      const key = generateIdempotencyKey();
      const uuidRegex =
        /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
      expect(key).toMatch(uuidRegex);
    });
  });

  describe('Token & Request Hashing (SHA-256)', () => {
    it('should deterministically hash tokens', () => {
      const token = 'sample-refresh-token-value';
      const hash1 = hashToken(token);
      const hash2 = hashToken(token);

      expect(hash1).toBe(hash2);
      expect(hash1).toHaveLength(64);
    });

    it('should deterministically hash request payloads', () => {
      const payload = { amountPaise: '50000', recipient: 'rahul@payflow' };
      const hash1 = hashRequest(payload);
      const hash2 = hashRequest(payload);

      expect(hash1).toBe(hash2);
      expect(hash1).toHaveLength(64);
    });

    it('should generate secure random hex tokens of designated byte size', () => {
      const token = generateSecureToken(32);
      expect(token).toHaveLength(64); // 32 bytes = 64 hex characters
    });
  });
});

