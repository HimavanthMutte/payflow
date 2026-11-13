import { Router } from 'express';
import { authMiddleware } from '../../middleware/auth.middleware';
import * as notificationsController from './notifications.controller';

export const notificationsRoutes = Router();

notificationsRoutes.use(authMiddleware);

/**
 * @openapi
 * /api/v1/notifications:
 *   get:
 *     tags: [Notifications]
 *     summary: Get user in-app notifications
 */
notificationsRoutes.get('/', notificationsController.getNotifications);

/**
 * @openapi
 * /api/v1/notifications/read-all:
 *   post:
 *     tags: [Notifications]
 *     summary: Mark all notifications as read
 */
notificationsRoutes.post('/read-all', notificationsController.markAllAsRead);

/**
 * @openapi
 * /api/v1/notifications/{id}/read:
 *   patch:
 *     tags: [Notifications]
 *     summary: Mark specific notification as read
 */
notificationsRoutes.patch('/:id/read', notificationsController.markAsRead);
