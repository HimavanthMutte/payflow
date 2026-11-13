import { createPaymentSchema, reversePaymentSchema } from '../../src/modules/payments/payments.schema';

describe('Payment Schema Validation Tests', () => {
  describe('createPaymentSchema', () => {
    const validPaymentPayload = {
      recipientVirtualId: 'rahul@payflow',
      amountPaise: '250000', // ₹2,500.00
      description: 'Dinner split',
      pin: '123456',
      idempotencyKey: 'c3971e40-8b1b-4f59-9944-596707328901',
      simulationScenario: 'SUCCESS',
    };

    it('should successfully validate a complete payment payload', () => {
      const result = createPaymentSchema.safeParse(validPaymentPayload);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.amountPaise).toBe(250000n);
        expect(result.data.recipientVirtualId).toBe('rahul@payflow');
        expect(result.data.simulationScenario).toBe('SUCCESS');
      }
    });

    it('should default simulationScenario to SUCCESS if omitted', () => {
      const { simulationScenario, ...payloadWithoutScenario } = validPaymentPayload;
      const result = createPaymentSchema.safeParse(payloadWithoutScenario);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.simulationScenario).toBe('SUCCESS');
      }
    });

    it('should accept all valid simulation scenarios', () => {
      const scenarios = ['SUCCESS', 'FAILURE', 'PENDING', 'TIMEOUT', 'DELAYED_SUCCESS'];
      for (const scenario of scenarios) {
        const result = createPaymentSchema.safeParse({
          ...validPaymentPayload,
          simulationScenario: scenario,
        });
        expect(result.success).toBe(true);
      }
    });

    it('should reject invalid PayFlow virtual payment IDs', () => {
      const invalidVpas = [
        'rahul@gmail.com',
        'rahul@upi',
        'invalid vpa@payflow',
        '@payflow',
        'rahul',
      ];
      for (const vpa of invalidVpas) {
        const result = createPaymentSchema.safeParse({
          ...validPaymentPayload,
          recipientVirtualId: vpa,
        });
        expect(result.success).toBe(false);
      }
    });

    it('should reject non-numeric paise amounts', () => {
      const result = createPaymentSchema.safeParse({
        ...validPaymentPayload,
        amountPaise: 'invalid-amount',
      });
      expect(result.success).toBe(false);
    });

    it('should reject invalid PIN formats', () => {
      const invalidPins = ['12345', '1234567', 'abcdef', '12345a'];
      for (const pin of invalidPins) {
        const result = createPaymentSchema.safeParse({
          ...validPaymentPayload,
          pin,
        });
        expect(result.success).toBe(false);
      }
    });

    it('should reject invalid UUID idempotency key', () => {
      const result = createPaymentSchema.safeParse({
        ...validPaymentPayload,
        idempotencyKey: 'not-a-valid-uuid',
      });
      expect(result.success).toBe(false);
    });
  });

  describe('reversePaymentSchema', () => {
    it('should allow optional reason for reversal', () => {
      expect(reversePaymentSchema.safeParse({}).success).toBe(true);
      expect(reversePaymentSchema.safeParse({ reason: 'Duplicate charge' }).success).toBe(true);
    });

    it('should reject reversal reason that exceeds 200 characters', () => {
      const longReason = 'A'.repeat(201);
      expect(reversePaymentSchema.safeParse({ reason: longReason }).success).toBe(false);
    });
  });
});
