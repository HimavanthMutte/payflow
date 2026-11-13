import { Router } from 'express';
import { authMiddleware } from '../../middleware/auth.middleware';
import { validate } from '../../middleware/validate.middleware';
import { createPaymentSchema, reversePaymentSchema } from './payments.schema';
import * as paymentsController from './payments.controller';

export const paymentsRoutes = Router();

paymentsRoutes.use(authMiddleware);

/**
 * @openapi
 * /api/v1/payments:
 *   post:
 *     tags: [Payments]
 *     summary: Initiate and process a UPI payment
 *   get:
 *     tags: [Payments]
 *     summary: List user payments (paginated)
 */
paymentsRoutes.post(
  '/',
  validate(createPaymentSchema),
  paymentsController.createPayment,
);
paymentsRoutes.get('/', paymentsController.listPayments);

/**
 * @openapi
 * /api/v1/payments/{id}:
 *   get:
 *     tags: [Payments]
 *     summary: Get payment details by ID
 */
paymentsRoutes.get('/:id', paymentsController.getPaymentById);

/**
 * @openapi
 * /api/v1/payments/{id}/status:
 *   get:
 *     tags: [Payments]
 *     summary: Poll payment status
 */
paymentsRoutes.get('/:id/status', paymentsController.getPaymentStatus);

/**
 * @openapi
 * /api/v1/payments/{id}/retry:
 *   post:
 *     tags: [Payments]
 *     summary: Retry a failed or pending payment
 */
paymentsRoutes.post('/:id/retry', paymentsController.retry);

/**
 * @openapi
 * /api/v1/payments/{id}/reverse:
 *   post:
 *     tags: [Payments]
 *     summary: Reverse a settled payment
 */
paymentsRoutes.post(
  '/:id/reverse',
  validate(reversePaymentSchema),
  paymentsController.reverse,
);
