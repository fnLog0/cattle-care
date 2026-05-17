import type { UserRow } from './schema';

export async function createUserByPhone(
  db: D1Database,
  id: string,
  phone: string,
): Promise<void> {
  await db
    .prepare(
      'INSERT INTO users (id, phone, phone_verified) VALUES (?, ?, 1)',
    )
    .bind(id, phone)
    .run();
}

export async function createUserByEmailPassword(
  db: D1Database,
  id: string,
  email: string,
  passwordHash: string,
  fullName: string | null,
): Promise<void> {
  await db
    .prepare(
      'INSERT INTO users (id, email, password_hash, full_name) VALUES (?, ?, ?, ?)',
    )
    .bind(id, email, passwordHash, fullName)
    .run();
}

export async function setUserPasswordHash(
  db: D1Database,
  userId: string,
  passwordHash: string,
): Promise<void> {
  await db
    .prepare(
      "UPDATE users SET password_hash = ?, updated_at = datetime('now') WHERE id = ?",
    )
    .bind(passwordHash, userId)
    .run();
}

export async function createUserByGoogle(
  db: D1Database,
  id: string,
  googleId: string,
  email: string,
  fullName: string | null,
  profileImage: string | null,
): Promise<void> {
  await db
    .prepare(
      'INSERT INTO users (id, google_id, email, full_name, profile_image) VALUES (?, ?, ?, ?, ?)',
    )
    .bind(id, googleId, email, fullName, profileImage)
    .run();
}

export async function linkGoogleToUser(
  db: D1Database,
  userId: string,
  googleId: string,
  email: string,
  profileImage: string | null,
): Promise<void> {
  await db
    .prepare(
      'UPDATE users SET google_id = ?, email = ?, profile_image = COALESCE(profile_image, ?), updated_at = datetime(\'now\') WHERE id = ?',
    )
    .bind(googleId, email, profileImage, userId)
    .run();
}

export async function updateUserProfile(
  db: D1Database,
  userId: string,
  updates: { full_name?: string; profile_image?: string },
): Promise<UserRow | null> {
  const fields: string[] = [];
  const values: unknown[] = [];

  if (updates.full_name !== undefined) {
    fields.push('full_name = ?');
    values.push(updates.full_name);
  }
  if (updates.profile_image !== undefined) {
    fields.push('profile_image = ?');
    values.push(updates.profile_image);
  }

  if (fields.length === 0) return null;

  fields.push("updated_at = datetime('now')");
  values.push(userId);

  await db
    .prepare(`UPDATE users SET ${fields.join(', ')} WHERE id = ?`)
    .bind(...values)
    .run();

  return db.prepare('SELECT * FROM users WHERE id = ?').bind(userId).first<UserRow>();
}
