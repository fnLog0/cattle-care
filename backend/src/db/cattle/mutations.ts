import type { CattleRow } from './schema';

export async function createCattle(
  db: D1Database,
  id: string,
  userId: string,
  data: {
    name: string;
    breed: CattleRow['breed'];
    age: number;
    weight: number;
    earTag: string;
  },
): Promise<CattleRow | null> {
  await db
    .prepare(
      'INSERT INTO cattle (id, user_id, name, breed, age, weight, ear_tag) VALUES (?, ?, ?, ?, ?, ?, ?)',
    )
    .bind(id, userId, data.name, data.breed, data.age, data.weight, data.earTag)
    .run();
  return db.prepare('SELECT * FROM cattle WHERE id = ?').bind(id).first<CattleRow>();
}

export async function updateCattle(
  db: D1Database,
  id: string,
  userId: string,
  updates: Partial<{
    name: string;
    breed: CattleRow['breed'];
    age: number;
    weight: number;
    earTag: string;
  }>,
): Promise<CattleRow | null> {
  const fields: string[] = [];
  const values: unknown[] = [];

  if (updates.name !== undefined) {
    fields.push('name = ?');
    values.push(updates.name);
  }
  if (updates.breed !== undefined) {
    fields.push('breed = ?');
    values.push(updates.breed);
  }
  if (updates.age !== undefined) {
    fields.push('age = ?');
    values.push(updates.age);
  }
  if (updates.weight !== undefined) {
    fields.push('weight = ?');
    values.push(updates.weight);
  }
  if (updates.earTag !== undefined) {
    fields.push('ear_tag = ?');
    values.push(updates.earTag);
  }

  if (fields.length === 0) return null;

  fields.push("updated_at = datetime('now')");
  values.push(id, userId);

  await db
    .prepare(`UPDATE cattle SET ${fields.join(', ')} WHERE id = ? AND user_id = ?`)
    .bind(...values)
    .run();

  return db.prepare('SELECT * FROM cattle WHERE id = ?').bind(id).first<CattleRow>();
}

export async function updateCattleStressLevel(
  db: D1Database,
  id: string,
  stressLevel: CattleRow['stress_level'],
): Promise<void> {
  await db
    .prepare("UPDATE cattle SET stress_level = ?, updated_at = datetime('now') WHERE id = ?")
    .bind(stressLevel, id)
    .run();
}

export async function deleteCattle(
  db: D1Database,
  id: string,
  userId: string,
): Promise<boolean> {
  const result = await db
    .prepare('DELETE FROM cattle WHERE id = ? AND user_id = ?')
    .bind(id, userId)
    .run();
  return result.meta.changes > 0;
}
