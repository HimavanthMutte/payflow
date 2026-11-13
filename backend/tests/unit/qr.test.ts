import { createQrSchema, decodeQrSchema } from '../../src/modules/qr/qr.schema';

describe('QR Module Unit Tests', () => {
  describe('createQrSchema', () => {
    it('should validate static QR request without amount', () => {
      const payload = { type: 'STATIC' };
      const res = createQrSchema.safeParse(payload);
      expect(res.success).toBe(true);
      if (res.success) {
        expect(res.data.type).toBe('STATIC');
        expect(res.data.amountPaise).toBeUndefined();
      }
    });

    it('should validate dynamic QR request with amount in paise', () => {
      const payload = {
        type: 'DYNAMIC',
        amountPaise: '50000', // ₹500.00
        description: 'Payment for groceries',
      };
      const res = createQrSchema.safeParse(payload);
      expect(res.success).toBe(true);
      if (res.success) {
        expect(res.data.type).toBe('DYNAMIC');
        expect(res.data.amountPaise).toBe(50000n);
        expect(res.data.description).toBe('Payment for groceries');
      }
    });

    it('should reject non-numeric amountPaise', () => {
      const payload = { type: 'DYNAMIC', amountPaise: 'invalid50' };
      expect(createQrSchema.safeParse(payload).success).toBe(false);
    });
  });

  describe('decodeQrSchema', () => {
    it('should validate non-empty payload string', () => {
      const valid = { payload: 'upi://pay?pa=alex@payflow&pn=Alex&cu=INR' };
      expect(decodeQrSchema.safeParse(valid).success).toBe(true);
    });

    it('should reject empty payload', () => {
      expect(decodeQrSchema.safeParse({ payload: '' }).success).toBe(false);
      expect(decodeQrSchema.safeParse({}).success).toBe(false);
    });
  });

  describe('UPI URI Parsing Logic', () => {
    function parseUpiPayload(rawUri: string) {
      if (!rawUri.startsWith('upi://pay?')) {
        throw new Error('Invalid UPI QR code format');
      }
      const query = rawUri.substring('upi://pay?'.length);
      const params = new URLSearchParams(query);
      const pa = params.get('pa');
      if (!pa) throw new Error('Missing payee address');
      return {
        pa,
        pn: params.get('pn'),
        am: params.get('am'),
        tn: params.get('tn'),
        cu: params.get('cu') || 'INR',
      };
    }

    it('should correctly extract parameters from standard UPI QR', () => {
      const uri = 'upi://pay?pa=rahul@payflow&pn=Rahul+Sharma&cu=INR&am=1200.50&tn=Office+Lunch';
      const parsed = parseUpiPayload(uri);

      expect(parsed.pa).toBe('rahul@payflow');
      expect(parsed.pn).toBe('Rahul Sharma');
      expect(parsed.am).toBe('1200.50');
      expect(parsed.tn).toBe('Office Lunch');
      expect(parsed.cu).toBe('INR');
    });

    it('should throw error for non-UPI schemes', () => {
      expect(() => parseUpiPayload('https://malicious.link/steal')).toThrow(
        'Invalid UPI QR code format',
      );
      expect(() => parseUpiPayload('arbitrary-text-qr')).toThrow(
        'Invalid UPI QR code format',
      );
    });

    it('should throw error when pa parameter is missing', () => {
      expect(() => parseUpiPayload('upi://pay?pn=Unknown&am=100')).toThrow(
        'Missing payee address',
      );
    });
  });
});
