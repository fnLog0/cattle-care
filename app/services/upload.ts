import { getStoredToken } from './api-client';

const BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:8787';

export type CattleImageUpload = {
  key: string;
  url: string;
  contentType: string;
  size: number;
};

/**
 * Upload a cattle image to the backend (which writes it to Cloudflare R2)
 * and returns the public URL to attach to a cattle row.
 *
 * `localUri` is the file:// URI from expo-image-picker.
 */
export async function uploadCattleImage(
  localUri: string,
  mimeType: 'image/jpeg' | 'image/png' | 'image/webp' = 'image/jpeg',
): Promise<CattleImageUpload> {
  const token = await getStoredToken();
  if (!token) throw new Error('Not authenticated');

  const form = new FormData();
  // React Native FormData accepts a `{ uri, name, type }` shape for files.
  form.append('image', {
    uri: localUri,
    name: `cattle.${mimeType === 'image/png' ? 'png' : mimeType === 'image/webp' ? 'webp' : 'jpg'}`,
    type: mimeType,
  } as unknown as Blob);

  const res = await fetch(`${BASE_URL}/api/upload/cattle-image`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      // Do NOT set Content-Type — let fetch add the multipart boundary.
    },
    body: form,
  });

  const json = (await res.json()) as {
    success: boolean;
    data?: CattleImageUpload;
    error?: string;
  };
  if (!res.ok || !json.success || !json.data) {
    throw new Error(json.error ?? 'Upload failed');
  }
  return json.data;
}
