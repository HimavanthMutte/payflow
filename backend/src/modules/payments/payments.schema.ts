import { z } from 'zod';

export const createPaymentSchema = z.object({
  recipientVirtualId: z
    .string()
    .min(1)
    .regex(/^[a-zA-Z0-9_.]+@payflow$/, 'Invalid PayFlow payment ID format'),
  amountPaise: z
    .string()
    .regex(/^\d+$/, 'Amount must be numeric paise')
    .transform((val) => BigInt(val)),
  description: z.string().max(200).optional(),
  pin: z.string().length(6).regex(/^\d{6}$/, 'PIN must be 6 digits'),
  idempotencyKey: z.string().uuid('Invalid idempotency key format'),
  simulationScenario: z
    .enum(['SUCCESS', 'FAILURE', 'PENDING', 'TIMEOUT', 'DELAYED_SUCCESS'])
    .optional()
    .default('SUCCESS'),
});

export const reversePaymentSchema = z.object({
  reason: z.string().max(200).optional(),
});

export type CreatePaymentDto = z.infer<typeof createPaymentSchema>;
export type ReversePaymentDto = z.infer<typeof reversePaymentSchema>;
