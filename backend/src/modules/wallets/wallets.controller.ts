import { Request, Response, NextFunction } from 'express';
import * as walletsService from './wallets.service';
import { successResponse } from '../../utils/response.util';
import { AuthenticatedRequest } from '../../middleware/auth.middleware';

export async function getWallet(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const userId = (req as AuthenticatedRequest).user.id;
    const wallet = await walletsService.getWallet(userId);
    res.json(successResponse(wallet));
  } catch (err) {
    next(err);
  }
}

export async function getBalance(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const userId = (req as AuthenticatedRequest).user.id;
    const balance = await walletsService.getBalance(userId);
    res.json(successResponse(balance));
  } catch (err) {
    next(err);
  }
}
