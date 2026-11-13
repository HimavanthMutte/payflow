import { Router } from 'express';
import { authMiddleware } from '../../middleware/auth.middleware';
import { validate } from '../../middleware/validate.middleware';
import { updateUserSchema, searchUsersSchema } from './users.schema';
import * as usersController from './users.controller';

export const usersRoutes = Router();

usersRoutes.use(authMiddleware);

/**
 * @openapi
 * /api/v1/users/me:
 *   get:
 *     tags: [Users]
 *     summary: Get current user profile
 *     responses:
 *       200: { description: User profile }
 */
usersRoutes.get('/me', usersController.getMe);

/**
 * @openapi
 * /api/v1/users/me:
 *   patch:
 *     tags: [Users]
 *     summary: Update current user profile
 */
usersRoutes.patch(
  '/me',
  validate(updateUserSchema),
  usersController.updateMe,
);

/**
 * @openapi
 * /api/v1/users/search:
 *   get:
 *     tags: [Users]
 *     summary: Search users by username or VPA
 *     parameters:
 *       - in: query
 *         name: q
 *         required: true
 *         schema: { type: string }
 */
usersRoutes.get(
  '/search',
  validate(searchUsersSchema, 'query'),
  usersController.searchUsers,
);

/**
 * @openapi
 * /api/v1/users/{id}:
 *   get:
 *     tags: [Users]
 *     summary: Get public user profile by ID
 */
usersRoutes.get('/:id', usersController.getUserById);
