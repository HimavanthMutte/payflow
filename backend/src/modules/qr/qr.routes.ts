import { Router } from 'express';
import { authMiddleware } from '../../middleware/auth.middleware';
import { validate } from '../../middleware/validate.middleware';
import { createQrSchema, decodeQrSchema } from './qr.schema';
import * as qrController from './qr.controller';

export const qrRoutes = Router();

qrRoutes.use(authMiddleware);

/**
 * @openapi
 * /api/v1/qr/generate:
 *   post:
 *     tags: [QR]
 *     summary: Generate static or dynamic UPI QR code
 */
qrRoutes.post(
  '/generate',
  validate(createQrSchema),
  qrController.generateQr,
);

/**
 * @openapi
 * /api/v1/qr/decode:
 *   post:
 *     tags: [QR]
 *     summary: Decode and parse UPI QR code string
 */
qrRoutes.post(
  '/decode',
  validate(decodeQrSchema),
  qrController.decodeQr,
);
