import type { AppContext } from '../types';

export function getDb(c: AppContext): D1Database {
  return c.env.DB;
}
