import {
  parsePaise,
  paiseToRupees,
  formatPaise,
  validateAmount,
  rupeesToPaise,
} from '../../src/utils/amount.util';

describe('Amount Utilities', () => {
  describe('parsePaise', () => {
    it('correctly parses string paise', () => {
      expect(parsePaise('10000')).toBe(10000n);
    });

    it('correctly handles number input', () => {
      expect(parsePaise(500)).toBe(500n);
    });

    it('correctly preserves bigint input', () => {
      expect(parsePaise(250000n)).toBe(250000n);
    });

    it('throws on non-numeric characters', () => {
      expect(() => parsePaise('100.50')).toThrow('Invalid paise amount');
      expect(() => parsePaise('abc')).toThrow('Invalid paise amount');
      expect(() => parsePaise('-500')).toThrow('Invalid paise amount');
    });
  });

  describe('paiseToRupees', () => {
    it('converts exact rupees', () => {
      expect(paiseToRupees(10000n)).toBe('100.00');
    });

    it('converts amounts with partial paise', () => {
      expect(paiseToRupees(10050n)).toBe('100.50');
      expect(paiseToRupees(105n)).toBe('1.05');
      expect(paiseToRupees(5n)).toBe('0.05');
    });

    it('handles zero paise', () => {
      expect(paiseToRupees(0n)).toBe('0.00');
    });

    it('handles large amounts', () => {
      expect(paiseToRupees(1000000000n)).toBe('10000000.00');
    });
  });

  describe('formatPaise', () => {
    it('prepends Rupee symbol', () => {
      expect(formatPaise(50000n)).toBe('₹500.00');
      expect(formatPaise(75n)).toBe('₹0.75');
    });
  });

  describe('rupeesToPaise', () => {
    it('converts decimal rupee strings to BigInt paise', () => {
      expect(rupeesToPaise('100.00')).toBe(10000n);
      expect(rupeesToPaise('49.50')).toBe(4950n);
      expect(rupeesToPaise('1')).toBe(100n);
    });
  });

  describe('validateAmount', () => {
    const min = 100n; // ₹1
    const max = 10000000n; // ₹1,00,000

    it('passes for amounts within range', () => {
      expect(() => validateAmount(50000n, min, max)).not.toThrow();
    });

    it('throws if amount is below minimum', () => {
      expect(() => validateAmount(50n, min, max)).toThrow('Amount below minimum');
    });

    it('throws if amount exceeds maximum', () => {
      expect(() => validateAmount(20000000n, min, max)).toThrow('Amount exceeds maximum');
    });

    it('throws if amount is zero or negative', () => {
      expect(() => validateAmount(0n, min, max)).toThrow('Amount must be positive');
    });
  });
});
