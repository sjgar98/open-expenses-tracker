import type { CredentialResponse } from '@react-oauth/google';
import type { OAuthCredentials } from '../model/auth';
import { jwtDecode } from 'jwt-decode';

export default function handleCredentialsResponse(credentialsResponse?: CredentialResponse): OAuthCredentials | null {
  if (credentialsResponse?.credential) {
    const oauthCredentials: OAuthCredentials = jwtDecode(credentialsResponse.credential);
    const tokenExpiration = new Date(oauthCredentials.exp * 1000);
    if (tokenExpiration > new Date()) {
      return oauthCredentials;
    }
  }
  return null;
}
