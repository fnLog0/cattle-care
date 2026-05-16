import type { AppContext } from '../types';

export function success<T>(c: AppContext, data: T, status: 200 | 201 = 200) {
  return c.json({ success: true, data }, status);
}

export function error(
  c: AppContext,
  message: string,
  status: 400 | 401 | 403 | 404 | 500 | 502 = 400,
) {
  return c.json({ success: false, error: message }, status);
}
