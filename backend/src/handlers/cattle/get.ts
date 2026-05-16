import type { AppContext } from '../../types';
import { getCattleByIdAndUser } from '../../db';
import { getDb } from '../../utils/db';
import { success, error } from '../../utils/responses';

export async function getCattle(c: AppContext) {
  const user = c.get('user');
  const db = getDb(c);
  const id = c.req.param('id') ?? '';

  const row = await getCattleByIdAndUser(db, id, user.id);
  if (!row) return error(c, 'Cattle not found', 404);

  return success(c, {
    id: row.id,
    name: row.name,
    breed: row.breed,
    age: row.age,
    weight: row.weight,
    earTag: row.ear_tag,
    imageUrl: row.image_url,
    stressLevel: row.stress_level,
    userId: row.user_id,
    createdAt: row.created_at,
  });
}
