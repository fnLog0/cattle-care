import type { AppContext } from '../../types';
import { getAllCattleByUser, searchCattleByUser } from '../../db';
import { getDb } from '../../utils/db';
import { success } from '../../utils/responses';

export async function listCattle(c: AppContext) {
  const user = c.get('user');
  const db = getDb(c);
  const q = c.req.query('q');

  const rows = q
    ? await searchCattleByUser(db, user.id, q)
    : await getAllCattleByUser(db, user.id);

  const cattle = rows.map((row) => ({
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
  }));

  return success(c, cattle);
}
