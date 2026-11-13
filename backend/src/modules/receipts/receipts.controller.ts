import { Request, Response, NextFunction } from 'express';
import * as receiptsService from './receipts.service';
import { successResponse } from '../../utils/response.util';
import { AuthenticatedRequest } from '../../middleware/auth.middleware';

export async function getReceipt(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const userId = (req as AuthenticatedRequest).user.id;
    const receipt = await receiptsService.getReceipt(req.params.paymentId, userId);
    res.json(successResponse(receipt));
  } catch (err) {
    next(err);
  }
}
