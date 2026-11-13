import { z } from 'zod';

export const updateUserSchema = z.object({
  displayName: z.string().min(2).max(50).optional(),
  phone: z
    .string()
    .regex(/^\+?[1-9]\d{9,14}$/, 'Invalid phone number')
    .optional(),
  avatarUrl: z.string().url().optional(),
});

export const searchUsersSchema = z.object({
  q: z.string().min(2, 'Search query must be at least 2 characters'),
});

export type UpdateUserDto = z.infer<typeof updateUserSchema>;
