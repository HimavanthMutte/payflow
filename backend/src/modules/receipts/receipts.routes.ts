import { Router } from 'express';
import { authMiddleware } from '../../middleware/auth.middleware';
import * as receiptsController from './receipts.controller';

export const receiptsRoutes = Router();

receiptsRoutes.use(authMiddleware);

/**
 * @openapi
 * /api/v1/receipts/{paymentId}:
 *   get:
 *     tags: [Receipts]
 *     summary: Get payment receipt details
 */
receiptsRoutes.get('/:paymentId', receiptsController.getReceipt);
