import type { AppContext } from '../../types';
import { success, error } from '../../utils/responses';

const ALLOWED_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp']);
const MAX_BYTES = 5 * 1024 * 1024; // 5 MB

export async function uploadCattleImageHandler(c: AppContext) {
  const user = c.get('user');
  const bucket = c.env.CATTLE_IMAGES;
  const publicBase = c.env.R2_PUBLIC_URL;

  if (!bucket || !publicBase) {
    return error(c, 'Image upload is not configured (CATTLE_IMAGES bucket / R2_PUBLIC_URL)', 500);
  }

  const form = await c.req.formData().catch(() => null);
  const entry = form?.get('image');

  // FormDataEntryValue is `string | File`. Treat anything Blob-like as the file.
  if (!entry || typeof entry === 'string') {
    return error(c, 'Missing "image" field (multipart/form-data)', 400);
  }
  const file = entry as Blob & { name?: string };

  if (!ALLOWED_TYPES.has(file.type)) {
    return error(c, 'Only JPEG, PNG, or WebP images are allowed', 400);
  }
  if (file.size === 0 || file.size > MAX_BYTES) {
    return error(c, `Image must be between 1 byte and ${MAX_BYTES} bytes`, 400);
  }

  const ext = file.type === 'image/png' ? 'png' : file.type === 'image/webp' ? 'webp' : 'jpg';
  const key = `cattle/${user.id}/${crypto.randomUUID().replace(/-/g, '')}.${ext}`;

  await bucket.put(key, file.stream(), {
    httpMetadata: { contentType: file.type },
  });

  return success(
    c,
    {
      key,
      url: `${publicBase.replace(/\/$/, '')}/${key}`,
      contentType: file.type,
      size: file.size,
    },
    201,
  );
}
