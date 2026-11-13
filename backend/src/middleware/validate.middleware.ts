import { Request, Response, NextFunction } from 'express';
import { ZodSchema } from 'zod';

export function validate(
  schema: ZodSchema,
  target: 'body' | 'query' | 'params' = 'body',
) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req[target]);
    if (!result.success) {
      return next(result.error);
    }
    // Replace raw data with parsed/coerced data
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (req as any)[target] = result.data;
    next();
  };
}
