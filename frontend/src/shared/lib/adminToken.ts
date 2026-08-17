const KEY = 'privalcafe:adminToken';

export function getAdminToken(): string | null {
  return sessionStorage.getItem(KEY);
}

export function setAdminToken(token: string): void {
  sessionStorage.setItem(KEY, token);
}

export function clearAdminToken(): void {
  sessionStorage.removeItem(KEY);
}

export function isAdminAuthed(): boolean {
  return !!getAdminToken();
}
