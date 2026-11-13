import { Request, Response, NextFunction } from 'express';
import * as usersService from './users.service';
import { successResponse } from '../../utils/response.util';
import { AuthenticatedRequest } from '../../middleware/auth.middleware';

export async function getMe(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const userId = (req as AuthenticatedRequest).user.id;
    const user = await usersService.getMe(userId);
    res.json(successResponse(user));
  } catch (err) {
    next(err);
  }
}

export async function updateMe(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const userId = (req as AuthenticatedRequest).user.id;
    const user = await usersService.updateMe(userId, req.body);
    res.json(successResponse(user, 'Profile updated'));
  } catch (err) {
    next(err);
  }
}

export async function searchUsers(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const userId = (req as AuthenticatedRequest).user.id;
    const q = req.query.q as string;
    const users = await usersService.searchUsers(q, userId);
    res.json(successResponse(users));
  } catch (err) {
    next(err);
  }
}

export async function getUserById(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const user = await usersService.getUserById(req.params.id);
    res.json(successResponse(user));
  } catch (err) {
    next(err);
  }
}
