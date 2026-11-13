import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { prisma } from '../config/database';
import { AuthError } from './error.middleware';

export interface AuthenticatedRequest extends Request {
  user: {
    id: string;
    email: string;
    username: string;
    virtualPaymentId: string;
  };
}

export async function authMiddleware(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      throw new AuthError('No token provided');
    }
    const token = authHeader.substring(7);
    const payload = jwt.verify(token, env.JWT_SECRET) as {
      sub: string;
      email: string;
    };

    const user = await prisma.user.findUnique({
      where: { id: payload.sub, status: 'ACTIVE' },
      select: {
        id: true,
        email: true,
        username: true,
        virtualPaymentId: true,
      },
    });

    if (!user) throw new AuthError('User not found or suspended');

    (req as AuthenticatedRequest).user = user;
    next();
  } catch (err) {
    if (err instanceof AuthError) return next(err);
    if (err instanceof jwt.JsonWebTokenError)
      return next(new AuthError('Invalid token'));
    if (err instanceof jwt.TokenExpiredError)
      return next(new AuthError('Token expired'));
    next(new AuthError());
  }
}
