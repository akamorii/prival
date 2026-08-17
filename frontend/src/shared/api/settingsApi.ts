import { http } from './http';

export interface AdminSettings {
  smtpEmail: string | null;
  notifyEmail: string | null;
  passwordSet: boolean;
}

export interface UpdateSettingsPayload {
  smtpEmail: string;
  smtpAppPassword?: string;
  notifyEmail: string;
}

export function fetchSettings(): Promise<AdminSettings> {
  return http.get<AdminSettings>('/api/settings');
}

export function updateSettings(payload: UpdateSettingsPayload): Promise<AdminSettings> {
  return http.put<AdminSettings>('/api/settings', payload);
}
