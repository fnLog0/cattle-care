import { z } from 'zod';
import type { AppContext } from '../../types';
import { success, error } from '../../utils/responses';
import { updateUserProfile } from '../../db/users/mutations';

const schema = z.object({
  fullName: z.string().min(1).max(100).optional(),
  image: z.string().url().optional(),
});

export async function updateProfileHandler(c: AppContext) {
  const body = await c.req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) return error(c, parsed.error.errors[0]?.message ?? 'Invalid input');

  const { fullName, image } = parsed.data;
  const user = c.get('user');

  const updated = await updateUserProfile(c.env.DB, user.id, {
    full_name: fullName,
    profile_image: image,
  });

  if (!updated) return error(c, 'No fields to update');

  return success(c, updated);
}
