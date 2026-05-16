import { z } from 'zod';
import type { AppContext } from '../../types';
import { getCattleByEarTag, createCattle } from '../../db';
import { getDb } from '../../utils/db';
import { success, error } from '../../utils/responses';
import { serializeCattle } from './serialize';

const CreateCattleSchema = z.object({
  name: z.string().min(1).max(100),
  breed: z.enum(['zebu', 'crossBreed', 'murrah']),
  age: z.number().min(0).max(30),
  weight: z.number().min(50).max(1000),
  earTag: z.string().min(1).max(50),
  imageUrl: z.string().url().optional(),
});

export async function createCattleHandler(c: AppContext) {
  const user = c.get('user');
  const db = getDb(c);

  const body = await c.req.json().catch(() => null);
  const parsed = CreateCattleSchema.safeParse(body);
  if (!parsed.success) {
    return error(c, parsed.error.errors[0]?.message ?? 'Invalid input', 400);
  }

  const { name, breed, age, weight, earTag, imageUrl } = parsed.data;

  const existing = await getCattleByEarTag(db, earTag);
  if (existing) return error(c, 'Ear tag already registered', 400);

  const id = crypto.randomUUID().replace(/-/g, '');
  const row = await createCattle(db, id, user.id, {
    name,
    breed,
    age,
    weight,
    earTag,
    imageUrl,
  });
  if (!row) return error(c, 'Failed to create cattle', 500);

  return success(c, { ...serializeCattle(row), latestVitals: null }, 201);
}
