import { env } from '@/config/env';
import { supabase } from '@/lib/supabase';

/** Storage buckets configured in the Supabase project. */
export const STORAGE_BUCKETS = {
  /** Public bucket for listing photos (public read, authenticated write). */
  listingImages: 'listing-images',
  /** Private bucket for verification documents (owner read/write only). */
  verificationDocs: 'verification-docs',
} as const;

function extensionFromUri(uri: string): string {
  const match = /\.([a-zA-Z0-9]+)(?:\?.*)?$/.exec(uri);
  const ext = match?.[1]?.toLowerCase();
  if (ext && ext.length <= 5) return ext;
  return 'jpg';
}

function contentTypeFor(ext: string): string {
  switch (ext) {
    case 'png':
      return 'image/png';
    case 'webp':
      return 'image/webp';
    case 'heic':
      return 'image/heic';
    case 'pdf':
      return 'application/pdf';
    default:
      return 'image/jpeg';
  }
}

/**
 * Read a local/remote image URI into a Blob for upload. Works on web (blob:/
 * data: URIs) and on native (file:// URIs) via the runtime `fetch` polyfill.
 */
async function uriToBlob(uri: string): Promise<Blob> {
  const res = await fetch(uri);
  return res.blob();
}

/**
 * Upload a single image to a Storage bucket and return its storage path.
 *
 * In mock mode (or without credentials) this is a no-op that returns the
 * original local URI so the rest of the flow works offline.
 */
export async function uploadImage(
  bucket: string,
  path: string,
  uri: string,
): Promise<string> {
  if (env.useMocks || !supabase) {
    return uri;
  }
  const ext = extensionFromUri(uri);
  const blob = await uriToBlob(uri);
  const { error } = await supabase.storage.from(bucket).upload(path, blob, {
    contentType: blob.type || contentTypeFor(ext),
    upsert: true,
  });
  if (error) throw error;
  return path;
}

/** Resolve a public URL for an object in a public bucket. */
export function publicUrl(bucket: string, path: string): string {
  if (env.useMocks || !supabase) return path;
  return supabase.storage.from(bucket).getPublicUrl(path).data.publicUrl;
}

/**
 * Upload an ordered set of listing photos to the public bucket.
 * Returns the resolved public URLs in the same order.
 */
export async function uploadListingImages(
  sellerProfileId: string,
  listingId: string,
  uris: string[],
): Promise<string[]> {
  if (env.useMocks || !supabase) return uris;
  const urls: string[] = [];
  for (let i = 0; i < uris.length; i += 1) {
    const ext = extensionFromUri(uris[i]);
    const path = `${sellerProfileId}/${listingId}/${i}-${Date.now()}.${ext}`;
    await uploadImage(STORAGE_BUCKETS.listingImages, path, uris[i]);
    urls.push(publicUrl(STORAGE_BUCKETS.listingImages, path));
  }
  return urls;
}

/**
 * Create short-lived signed URLs for private verification documents so an
 * admin/owner can preview them. Returns an empty array in mock mode.
 */
export async function signedVerificationDocUrls(
  paths: string[],
  expiresInSeconds = 300,
): Promise<string[]> {
  if (env.useMocks || !supabase || paths.length === 0) return [];
  const { data, error } = await supabase.storage
    .from(STORAGE_BUCKETS.verificationDocs)
    .createSignedUrls(paths, expiresInSeconds);
  if (error) throw error;
  return (data ?? []).map((d) => d.signedUrl).filter((u): u is string => Boolean(u));
}

/**
 * Upload verification documents to the private bucket. Paths MUST be prefixed
 * with the user's auth id to satisfy the owner-write RLS policy.
 * Returns the storage paths (not public URLs — the bucket is private).
 */
export async function uploadVerificationDocs(
  userId: string,
  uris: string[],
): Promise<string[]> {
  if (env.useMocks || !supabase) return uris;
  const paths: string[] = [];
  for (let i = 0; i < uris.length; i += 1) {
    const ext = extensionFromUri(uris[i]);
    const path = `${userId}/${Date.now()}-${i}.${ext}`;
    await uploadImage(STORAGE_BUCKETS.verificationDocs, path, uris[i]);
    paths.push(path);
  }
  return paths;
}
