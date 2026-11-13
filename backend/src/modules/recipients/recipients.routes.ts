import { Router } from 'express';
import { authMiddleware } from '../../middleware/auth.middleware';
import { validate } from '../../middleware/validate.middleware';
import { addFavouriteSchema, searchRecipientsSchema } from './recipients.schema';
import * as recipientsController from './recipients.controller';

export const recipientsRoutes = Router();

recipientsRoutes.use(authMiddleware);

/**
 * @openapi
 * /api/v1/recipients/search:
 *   get:
 *     tags: [Recipients]
 *     summary: Search recipients by VPA, username, or phone
 */
recipientsRoutes.get(
  '/search',
  validate(searchRecipientsSchema, 'query'),
  recipientsController.searchRecipients,
);

/**
 * @openapi
 * /api/v1/recipients/recent:
 *   get:
 *     tags: [Recipients]
 *     summary: Get recent payment recipients
 */
recipientsRoutes.get('/recent', recipientsController.getRecentRecipients);

/**
 * @openapi
 * /api/v1/recipients/favourites:
 *   get:
 *     tags: [Recipients]
 *     summary: Get favourite recipients
 *   post:
 *     tags: [Recipients]
 *     summary: Add favourite recipient
 */
recipientsRoutes.get('/favourites', recipientsController.getFavourites);
recipientsRoutes.post(
  '/favourites',
  validate(addFavouriteSchema),
  recipientsController.addFavourite,
);

/**
 * @openapi
 * /api/v1/recipients/favourites/{recipientId}:
 *   delete:
 *     tags: [Recipients]
 *     summary: Remove favourite recipient
 */
recipientsRoutes.delete(
  '/favourites/:recipientId',
  recipientsController.removeFavourite,
);
