import { Request, Response, NextFunction } from 'express';
import * as transactionsService from './transactions.service';
import { paginatedResponse, successResponse } from '../../utils/response.util';
import { AuthenticatedRequest } from '../../middleware/auth.middleware';

export async function getTransactions(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const userId = (req as AuthenticatedRequest).user.id;
    const { items, total, page, limit } =
      await transactionsService.getTransactions(userId, req.query);
    res.json(paginatedResponse(items, total, page, limit));
  } catch (err) {
    next(err);
  }
}

export async function getTransactionById(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const userId = (req as AuthenticatedRequest).user.id;
    const transaction = await transactionsService.getTransactionById(
      req.params.id,
      userId,
    );
    res.json(successResponse(transaction));
  } catch (err) {
    next(err);
  }
}
