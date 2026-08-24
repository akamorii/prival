import { config } from '../config/env';

export function resolvePhotoUrl(photoUrl?: string | null): string | undefined {
  if (!photoUrl) return undefined;
  if (photoUrl.startsWith('http://') || photoUrl.startsWith('https://')) return photoUrl;
  return `${config.apiBaseUrl}${photoUrl}`;
}
