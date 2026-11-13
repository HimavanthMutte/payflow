import { z } from 'zod';

export const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  username: z
    .string()
    .min(3, 'Username must be at least 3 characters')
    .max(30, 'Username cannot exceed 30 characters')
    .regex(
      /^[a-zA-Z0-9_]+$/,
      'Username: letters, numbers, underscores only',
    ),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      'Password must have uppercase, lowercase, and number',
    ),
  displayName: z
    .string()
    .min(2, 'Display name too short')
    .max(50, 'Display name too long'),
  phone: z
    .string()
    .regex(/^\+?[1-9]\d{9,14}$/, 'Invalid phone number')
    .optional(),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const refreshSchema = z.object({
  refreshToken: z.string().min(1),
});

export const setPinSchema = z
  .object({
    pin: z
      .string()
      .length(6, 'PIN must be exactly 6 digits')
      .regex(/^\d{6}$/, 'PIN must be 6 digits'),
    confirmPin: z.string().length(6),
  })
  .refine((d) => d.pin === d.confirmPin, {
    message: 'PINs do not match',
    path: ['confirmPin'],
  });

export const changePinSchema = z
  .object({
    currentPin: z.string().length(6).regex(/^\d{6}$/),
    newPin: z.string().length(6).regex(/^\d{6}$/),
    confirmNewPin: z.string().length(6),
  })
  .refine((d) => d.newPin === d.confirmNewPin, {
    message: 'New PINs do not match',
    path: ['confirmNewPin'],
  })
  .refine((d) => d.currentPin !== d.newPin, {
    message: 'New PIN must be different from current PIN',
    path: ['newPin'],
  });

export type RegisterDto = z.infer<typeof registerSchema>;
export type LoginDto = z.infer<typeof loginSchema>;
export type RefreshDto = z.infer<typeof refreshSchema>;
export type SetPinDto = z.infer<typeof setPinSchema>;
export type ChangePinDto = z.infer<typeof changePinSchema>;
