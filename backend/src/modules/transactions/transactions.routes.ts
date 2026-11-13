import { Router } from 'express';
import { authMiddleware } from '../../middleware/auth.middleware';
import * as transactionsController from './transactions.controller';

export const transactionsRoutes = Router();

transactionsRoutes.use(authMiddleware);

/**
 * @openapi
 * /api/v1/transactions:
 *   get:
 *     tags: [Transactions]
 *     summary: Get user double-entry ledger transaction history
 */
transactionsRoutes.get('/', transactionsController.getTransactions);

/**
 * @openapi
 * /api/v1/transactions/{id}:
 *   get:
 *     tags: [Transactions]
 *     summary: Get transaction details with counterparty and audit metadata
 */
transactionsRoutes.get('/:id', transactionsController.getTransactionById);
