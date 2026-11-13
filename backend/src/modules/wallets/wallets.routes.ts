import { Router } from 'express';
import { authMiddleware } from '../../middleware/auth.middleware';
import * as walletsController from './wallets.controller';

export const walletsRoutes = Router();

walletsRoutes.use(authMiddleware);

/**
 * @openapi
 * /api/v1/wallet:
 *   get:
 *     tags: [Wallet]
 *     summary: Get user wallet details and limits
 */
walletsRoutes.get('/', walletsController.getWallet);

/**
 * @openapi
 * /api/v1/wallet/balance:
 *   get:
 *     tags: [Wallet]
 *     summary: Get user current balance
 */
walletsRoutes.get('/balance', walletsController.getBalance);
