import { Request, Response, NextFunction } from 'express';
import * as notificationsService from './notifications.service';
import { successResponse } from '../../utils/response.util';
import { AuthenticatedRequest } from '../../middleware/auth.middleware';

export async function getNotifications(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const userId = (req as AuthenticatedRequest).user.id;
    const result = await notificationsService.getNotifications(
      userId,
      req.query,
    );
    res.json(successResponse(result));
  } catch (err) {
    next(err);
  }
}

export async function markAsRead(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const userId = (req as AuthenticatedRequest).user.id;
    await notificationsService.markAsRead(req.params.id, userId);
    res.json(successResponse(null, 'Notification marked as read'));
  } catch (err) {
    next(err);
  }
}

export async function markAllAsRead(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const userId = (req as AuthenticatedRequest).user.id;
    await notificationsService.markAllAsRead(userId);
    res.json(successResponse(null, 'All notifications marked as read'));
  } catch (err) {
    next(err);
  }
}
