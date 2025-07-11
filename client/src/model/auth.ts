export interface CredentialResponse {
  access_token: string;
}

export interface CookieValues {
  oet_auth_jwt?: string;
}

export interface AuthCredentials {
  sub: string;
  username: string;
  iat: number;
  exp: number;
}

export interface AuthState {
  credentials: AuthCredentials | null;
  isAuthenticated: boolean;
}
