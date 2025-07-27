export interface CredentialResponse {
  access_token: string;
}

export interface CookieValues {
  oet_auth_jwt?: string;
}

export interface AuthCredentials {
  sub: string;
  username: string;
  isAdmin: boolean;
  iat: number;
  exp: number;
}

export interface AuthState {
  credentials: AuthCredentials | null;
  token: string | null;
  isAuthenticated: boolean;
}

export interface LoginDto {
  username: string;
  password: string;
}

export interface SignUpDto {
  username: string;
  password: string;
  repeatPassword: string;
  email?: string;
}

