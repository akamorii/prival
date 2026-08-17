import { loginRequest } from '../api/authApi';
import { clearAdminToken, isAdminAuthed, setAdminToken } from './adminToken';

export { isAdminAuthed };

export async function loginAdmin(passcode: string): Promise<boolean> {
  try {
    const token = await loginRequest(passcode);
    setAdminToken(token);
    return true;
  } catch {
    return false;
  }
}

export function logoutAdmin(): void {
  clearAdminToken();
}
