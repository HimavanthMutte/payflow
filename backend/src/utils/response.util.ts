export function successResponse<T>(data: T, message?: string, meta?: object) {
  return { success: true, message, data, meta, simulation: true };
}

export function errorResponse(
  code: string,
  message: string,
  details?: unknown,
) {
  return { success: false, error: { code, message, details } };
}

export function paginatedResponse<T>(
  items: T[],
  total: number,
  page: number,
  limit: number,
) {
  return {
    success: true,
    data: items,
    meta: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      hasNext: page * limit < total,
      hasPrev: page > 1,
    },
    simulation: true,
  };
}
