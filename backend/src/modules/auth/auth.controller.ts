import { Request, Response, NextFunction } from 'express';
import * as authService from './auth.service';
import { successResponse } from '../../utils/response.util';
import { AuthenticatedRequest } from '../../middleware/auth.middleware';

export async function register(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const result = await authService.register(req.body);
    res.status(201).json(
      successResponse(result, 'Registration successful'),
    );
  } catch (err) {
    next(err);
  }
}

export async function login(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const result = await authService.login(req.body);
    res.json(successResponse(result, 'Login successful'));
  } catch (err) {
    next(err);
  }
}

export async function refresh(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { refreshToken } = req.body;
    const tokens = await authService.refreshTokens(refreshToken);
    res.json(successResponse(tokens, 'Tokens refreshed'));
  } catch (err) {
    next(err);
  }
}

export async function logout(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { refreshToken } = req.body;
    await authService.logout(refreshToken);
    res.json(successResponse(null, 'Logged out successfully'));
  } catch (err) {
    next(err);
  }
}

export async function setPin(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const userId = (req as AuthenticatedRequest).user.id;
    await authService.setTransactionPin(userId, req.body);
    res.json(successResponse(null, 'Transaction PIN set successfully'));
  } catch (err) {
    next(err);
  }
}

export async function changePin(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const userId = (req as AuthenticatedRequest).user.id;
    await authService.changeTransactionPin(userId, req.body);
    res.json(successResponse(null, 'Transaction PIN changed successfully'));
  } catch (err) {
    next(err);
  }
}
