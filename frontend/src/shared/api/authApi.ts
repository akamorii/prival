import { http } from './http';

export async function loginRequest(passcode: string): Promise<string> {
  const { token } = await http.post<{ token: string }>('/api/auth/login', { passcode });
  return token;
}
