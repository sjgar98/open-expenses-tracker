import type { CredentialResponse } from '@react-oauth/google';

export interface CookieValues {
  g_oa_cr?: CredentialResponse;
}

export interface OAuthCredentials {
  iss: string;
  azp: string;
  aud: string;
  sub: string;
  email: string;
  email_verified: boolean;
  nbf: number;
  name: string;
  picture: string;
  given_name: string;
  iat: number;
  exp: number;
  jti: number;
}

export interface AuthState {
  credentials: OAuthCredentials | null;
  isAuthenticated: boolean;
}
