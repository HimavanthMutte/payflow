import { z } from 'zod';

export const addFavouriteSchema = z.object({
  recipientId: z.string().uuid('Invalid recipient ID format'),
});

export const searchRecipientsSchema = z.object({
  q: z.string().min(1, 'Search query is required'),
});
