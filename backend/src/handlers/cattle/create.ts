import { z } from 'zod';
import type { AppContext } from '../../types';
import { getCattleByEarTag, createCattle } from '../../db';
import { getDb } from '../../utils/db';
import { success, error } from '../../utils/responses';

const CreateCattleSchema = z.object({
  name: z.string().min(1).max(100),
  breed: z.enum(['zebu', 'crossBreed', 'murrah']),
  age: z.number().min(0).max(30),
  weight: z.number().min(50).max(1000),
  earTag: z.string().min(1).max(50),
});

export async function createCattleHandler(c: AppContext) {
  const user = c.get('user');
  const db = getDb(c);

  const body = await c.req.json().catch(() => null);
  const parsed = CreateCattleSchema.safeParse(body);
  if (!parsed.success) {
    return error(c, parsed.error.errors[0]?.message ?? 'Invalid input', 400);
  }

  const { name, breed, age, weight, earTag } = parsed.data;

  const existing = await getCattleByEarTag(db, earTag);
  if (existing) return error(c, 'Ear tag already registered', 400);

  const id = crypto.randomUUID().replace(/-/g, '');
  const row = await createCattle(db, id, user.id, { name, breed, age, weight, earTag });
  if (!row) return error(c, 'Failed to create cattle', 500);

  return success(
    c,
    {
      id: row.id,
      name: row.name,
      breed: row.breed,
      age: row.age,
      weight: row.weight,
      earTag: row.ear_tag,
      stressLevel: row.stress_level,
      userId: row.user_id,
      createdAt: row.created_at,
    },
    201,
  );
}
