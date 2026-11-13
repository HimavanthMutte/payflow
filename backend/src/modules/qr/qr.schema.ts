import { z } from 'zod';

export const createQrSchema = z.object({
  type: z.enum(['STATIC', 'DYNAMIC']).default('STATIC'),
  amountPaise: z
    .string()
    .regex(/^\d+$/)
    .transform((v) => BigInt(v))
    .optional(),
  description: z.string().max(100).optional(),
});

export const decodeQrSchema = z.object({
  payload: z.string().min(1, 'QR payload is required'),
});

export type CreateQrDto = z.infer<typeof createQrSchema>;
