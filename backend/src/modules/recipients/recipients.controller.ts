import { Request, Response, NextFunction } from 'express';
import * as recipientsService from './recipients.service';
import { successResponse } from '../../utils/response.util';
import { AuthenticatedRequest } from '../../middleware/auth.middleware';

export async function searchRecipients(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const userId = (req as AuthenticatedRequest).user.id;
    const q = (req.query.q as string) || '';
    const recipients = await recipientsService.searchRecipients(q, userId);
    res.json(successResponse(recipients));
  } catch (err) {
    next(err);
  }
}

export async function getRecentRecipients(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const userId = (req as AuthenticatedRequest).user.id;
    const recipients = await recipientsService.getRecentRecipients(userId);
    res.json(successResponse(recipients));
  } catch (err) {
    next(err);
  }
}

export async function getFavourites(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const userId = (req as AuthenticatedRequest).user.id;
    const favourites = await recipientsService.getFavourites(userId);
    res.json(successResponse(favourites));
  } catch (err) {
    next(err);
  }
}

export async function addFavourite(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const userId = (req as AuthenticatedRequest).user.id;
    const { recipientId } = req.body;
    const favourite = await recipientsService.addFavourite(userId, recipientId);
    res.status(201).json(successResponse(favourite, 'Added to favourites'));
  } catch (err) {
    next(err);
  }
}

export async function removeFavourite(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const userId = (req as AuthenticatedRequest).user.id;
    const recipientId = req.params.recipientId;
    await recipientsService.removeFavourite(userId, recipientId);
    res.json(successResponse(null, 'Removed from favourites'));
  } catch (err) {
    next(err);
  }
}
