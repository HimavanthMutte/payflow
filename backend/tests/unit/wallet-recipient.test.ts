import { paiseToRupees, formatPaise } from '../../src/utils/amount.util';
import {
  addFavouriteSchema,
  searchRecipientsSchema,
} from '../../src/modules/recipients/recipients.schema';

describe('Wallet & Recipient Unit Tests', () => {
  describe('Wallet Balance Conversions', () => {
    it('should format zero balance correctly', () => {
      const balance = 0n;
      expect(paiseToRupees(balance)).toBe('0.00');
      expect(formatPaise(balance)).toBe('₹0.00');
    });

    it('should format standard wallet balance with rupees and paise', () => {
      const balance = 254050n; // ₹2,540.50
      expect(paiseToRupees(balance)).toBe('2540.50');
      expect(formatPaise(balance)).toBe('₹2540.50');
    });

    it('should format single-digit paise with leading zero', () => {
      const balance = 10005n; // ₹100.05
      expect(paiseToRupees(balance)).toBe('100.05');
      expect(formatPaise(balance)).toBe('₹100.05');
    });

    it('should handle large simulated balances safely with BigInt', () => {
      const balance = 100000000000n; // ₹1,000,000,000.00
      expect(paiseToRupees(balance)).toBe('1000000000.00');
      expect(formatPaise(balance)).toBe('₹1000000000.00');
    });
  });

  describe('Recipient Validation Schemas', () => {
    it('should validate valid UUID recipientId for favourites', () => {
      const valid = { recipientId: '123e4567-e89b-12d3-a456-426614174000' };
      const res = addFavouriteSchema.safeParse(valid);
      expect(res.success).toBe(true);
    });

    it('should reject invalid UUID recipientId', () => {
      const invalid = { recipientId: 'not-a-uuid' };
      const res = addFavouriteSchema.safeParse(invalid);
      expect(res.success).toBe(false);
    });

    it('should require search query to have at least 1 character', () => {
      expect(searchRecipientsSchema.safeParse({ q: 'rahul' }).success).toBe(true);
      expect(searchRecipientsSchema.safeParse({ q: '' }).success).toBe(false);
      expect(searchRecipientsSchema.safeParse({}).success).toBe(false);
    });
  });
});
