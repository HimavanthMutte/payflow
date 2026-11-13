import { Request, Response, NextFunction } from 'express';
import * as qrService from './qr.service';
import { successResponse } from '../../utils/response.util';
import { AuthenticatedRequest } from '../../middleware/auth.middleware';

export async function generateQr(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const userId = (req as AuthenticatedRequest).user.id;
    const qr = await qrService.generateQr(userId, req.body);
    res.status(201).json(successResponse(qr, 'QR code generated'));
  } catch (err) {
    next(err);
  }
}

export async function decodeQr(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { payload } = req.body;
    const result = await qrService.decodeQr(payload);
    res.json(successResponse(result));
  } catch (err) {
    next(err);
  }
}
