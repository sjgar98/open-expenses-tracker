import type { AuthCredentials } from '../model/auth';
import { jwtDecode } from 'jwt-decode';

export default function handleCredentialsResponse(access_token?: string | null): AuthCredentials | null {
  if (access_token) {
    const oauthCredentials: AuthCredentials = jwtDecode(access_token);
    const tokenExpiration = new Date(oauthCredentials.exp * 1000);
    if (tokenExpiration > new Date()) {
      return oauthCredentials;
    }
  }
  return null;
}

