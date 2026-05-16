import { z } from 'zod';
import type { AppContext } from '../../types';
import { getCattleByIdAndUser, getCattleByEarTag, updateCattle } from '../../db';
import { getCattleByIdAndUserWithVitals } from '../../db/cattle/queries';
import { getDb } from '../../utils/db';
import { success, error } from '../../utils/responses';
import { serializeCattleWithVitals } from './serialize';

const UpdateCattleSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  breed: z.enum(['zebu', 'crossBreed', 'murrah']).optional(),
  age: z.number().min(0).max(30).optional(),
  weight: z.number().min(50).max(1000).optional(),
  earTag: z.string().min(1).max(50).optional(),
  imageUrl: z.union([z.string().url(), z.null()]).optional(),
});

export async function updateCattleHandler(c: AppContext) {
  const user = c.get('user');
  const db = getDb(c);
  const id = c.req.param('id') ?? '';

  const existing = await getCattleByIdAndUser(db, id, user.id);
  if (!existing) return error(c, 'Cattle not found', 404);

  const body = await c.req.json().catch(() => null);
  const parsed = UpdateCattleSchema.safeParse(body);
  if (!parsed.success) {
    return error(c, parsed.error.errors[0]?.message ?? 'Invalid input', 400);
  }

  const updates = parsed.data;

  if (updates.earTag && updates.earTag !== existing.ear_tag) {
    const conflict = await getCattleByEarTag(db, updates.earTag);
    if (conflict) return error(c, 'Ear tag already registered', 400);
  }

  const row = await updateCattle(db, id, user.id, updates);
  if (!row) return error(c, 'No changes made', 400);

  const enriched = await getCattleByIdAndUserWithVitals(db, row.id, user.id);
  return success(c, enriched ? serializeCattleWithVitals(enriched) : null);
}
