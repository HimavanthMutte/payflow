import { Router } from 'express';
import { validate } from '../../middleware/validate.middleware';
import { authMiddleware } from '../../middleware/auth.middleware';
import {
  registerSchema,
  loginSchema,
  refreshSchema,
  setPinSchema,
  changePinSchema,
} from './auth.schema';
import * as authController from './auth.controller';

export const authRoutes = Router();

/**
 * @openapi
 * /api/v1/auth/register:
 *   post:
 *     tags: [Auth]
 *     summary: Register a new user
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, username, password, displayName]
 *             properties:
 *               email: { type: string, format: email }
 *               username: { type: string, minLength: 3, maxLength: 30 }
 *               password: { type: string, minLength: 8 }
 *               displayName: { type: string }
 *               phone: { type: string }
 *     responses:
 *       201: { description: User registered successfully }
 *       409: { description: Email or username already taken }
 */
authRoutes.post(
  '/register',
  validate(registerSchema),
  authController.register,
);

/**
 * @openapi
 * /api/v1/auth/login:
 *   post:
 *     tags: [Auth]
 *     summary: Login with email and password
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email: { type: string }
 *               password: { type: string }
 *     responses:
 *       200: { description: Login successful }
 *       401: { description: Invalid credentials }
 */
authRoutes.post('/login', validate(loginSchema), authController.login);

/**
 * @openapi
 * /api/v1/auth/refresh:
 *   post:
 *     tags: [Auth]
 *     summary: Refresh access token
 *     security: []
 */
authRoutes.post(
  '/refresh',
  validate(refreshSchema),
  authController.refresh,
);

/**
 * @openapi
 * /api/v1/auth/logout:
 *   post:
 *     tags: [Auth]
 *     summary: Logout (revoke refresh token)
 */
authRoutes.post(
  '/logout',
  validate(refreshSchema),
  authController.logout,
);

/**
 * @openapi
 * /api/v1/auth/pin/set:
 *   post:
 *     tags: [Auth]
 *     summary: Set transaction PIN (first time)
 */
authRoutes.post(
  '/pin/set',
  authMiddleware,
  validate(setPinSchema),
  authController.setPin,
);

/**
 * @openapi
 * /api/v1/auth/pin/change:
 *   post:
 *     tags: [Auth]
 *     summary: Change existing transaction PIN
 */
authRoutes.post(
  '/pin/change',
  authMiddleware,
  validate(changePinSchema),
  authController.changePin,
);
