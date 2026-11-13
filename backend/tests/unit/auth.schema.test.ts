import {
  registerSchema,
  loginSchema,
  setPinSchema,
  changePinSchema,
} from '../../src/modules/auth/auth.schema';

describe('Auth Schema Validation', () => {
  describe('registerSchema', () => {
    it('should accept valid registration data', () => {
      const validData = {
        email: 'alex@payflow.com',
        username: 'alex_fintech',
        password: 'Password123!',
        displayName: 'Alex Mercer',
        phone: '+919876543210',
      };
      const result = registerSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should reject invalid email format', () => {
      const invalidData = {
        email: 'not-an-email',
        username: 'alex_fintech',
        password: 'Password123!',
        displayName: 'Alex Mercer',
      };
      const result = registerSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should reject weak password missing uppercase or numbers', () => {
      const weakPasswordData = {
        email: 'alex@payflow.com',
        username: 'alex_fintech',
        password: 'passwordonly',
        displayName: 'Alex Mercer',
      };
      const result = registerSchema.safeParse(weakPasswordData);
      expect(result.success).toBe(false);
    });

    it('should reject username with illegal special characters', () => {
      const badUsernameData = {
        email: 'alex@payflow.com',
        username: 'alex@upi!#$',
        password: 'Password123!',
        displayName: 'Alex Mercer',
      };
      const result = registerSchema.safeParse(badUsernameData);
      expect(result.success).toBe(false);
    });
  });

  describe('loginSchema', () => {
    it('should accept valid login payload', () => {
      const valid = { email: 'demo@payflow.com', password: 'Demo@1234Password' };
      const result = loginSchema.safeParse(valid);
      expect(result.success).toBe(true);
    });

    it('should reject missing password or empty email', () => {
      const invalid = { email: '', password: '' };
      const result = loginSchema.safeParse(invalid);
      expect(result.success).toBe(false);
    });
  });

  describe('setPinSchema', () => {
    it('should accept matching 6-digit numeric PIN', () => {
      const validPin = { pin: '123456', confirmPin: '123456' };
      const result = setPinSchema.safeParse(validPin);
      expect(result.success).toBe(true);
    });

    it('should reject non-numeric PIN or incorrect length', () => {
      const nonNumeric = { pin: '12a456', confirmPin: '12a456' };
      expect(setPinSchema.safeParse(nonNumeric).success).toBe(false);

      const tooShort = { pin: '1234', confirmPin: '1234' };
      expect(setPinSchema.safeParse(tooShort).success).toBe(false);
    });

    it('should reject mismatched confirmation PIN', () => {
      const mismatch = { pin: '123456', confirmPin: '654321' };
      const result = setPinSchema.safeParse(mismatch);
      expect(result.success).toBe(false);
    });
  });

  describe('changePinSchema', () => {
    it('should accept valid current and matching new PIN', () => {
      const payload = {
        currentPin: '111111',
        newPin: '999999',
        confirmNewPin: '999999',
      };
      const result = changePinSchema.safeParse(payload);
      expect(result.success).toBe(true);
    });

    it('should reject mismatched new PIN confirmation', () => {
      const payload = {
        currentPin: '111111',
        newPin: '999999',
        confirmNewPin: '888888',
      };
      const result = changePinSchema.safeParse(payload);
      expect(result.success).toBe(false);
    });
  });
});

