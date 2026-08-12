import { useState } from 'react';
import { config } from '../config/env';

const KEY = 'privalcafe:adminAuth';

export function isAdminAuthed(): boolean {
  return sessionStorage.getItem(KEY) === '1';
}

export function loginAdmin(passcode: string): boolean {
  const ok = passcode === config.adminPasscode;
  if (ok) sessionStorage.setItem(KEY, '1');
  return ok;
}

export function logoutAdmin(): void {
  sessionStorage.removeItem(KEY);
}

export function useAdminAuthState() {
  const [authed, setAuthed] = useState(isAdminAuthed());
  return {
    authed,
    login: (passcode: string) => {
      const ok = loginAdmin(passcode);
      if (ok) setAuthed(true);
      return ok;
    },
    logout: () => {
      logoutAdmin();
      setAuthed(false);
    },
  };
}
