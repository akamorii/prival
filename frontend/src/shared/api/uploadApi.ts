import { config } from '../config/env';
import { getAdminToken } from '../lib/adminToken';
import { ApiError } from './http';

export async function uploadImage(file: File): Promise<string> {
  const formData = new FormData();
  formData.append('file', file);

  const token = getAdminToken();
  const headers: Record<string, string> = {};
  if (token) headers.Authorization = `Bearer ${token}`;

  const response = await fetch(`${config.apiBaseUrl}/api/uploads`, {
    method: 'POST',
    headers,
    body: formData,
  });

  if (!response.ok) {
    let detail = response.statusText;
    try {
      const body = await response.json();
      detail = body.detail ?? detail;
    } catch {
      // ответ без тела
    }
    throw new ApiError(response.status, detail);
  }

  const data = (await response.json()) as { url: string };
  return data.url;
}
