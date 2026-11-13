import { Request } from 'express';

export interface AuthenticatedRequest extends Request {
  user: {
    id: string;
    email: string;
    username: string;
    virtualPaymentId: string;
  };
}

export interface PaginationParams {
  page: number;
  limit: number;
  skip: number;
}

export function getPagination(query: {
  page?: string;
  limit?: string;
}): PaginationParams {
  const page = Math.max(1, parseInt(query.page || '1', 10));
  const limit = Math.min(100, Math.max(1, parseInt(query.limit || '20', 10)));
  return { page, limit, skip: (page - 1) * limit };
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: { code: string; message: string; details?: unknown };
  meta?: object;
  simulation: boolean;
}
