import { Outlet, Navigate } from 'react-router';
import { useState } from 'react';
import { useCookies } from 'react-cookie';
import { jwtDecode } from 'jwt-decode';
import type { CredentialResponse } from '@react-oauth/google';
import type { CookieValues, OAuthCredentials } from '../../model/auth';

export default function ProtectedRoute() {
  const [cookies] = useCookies<'g_oa_cr', CookieValues>(['g_oa_cr']);
  const [credentials] = useState<OAuthCredentials | null>(handleCredentialsResponse(cookies?.g_oa_cr));
  function handleCredentialsResponse(credentialsResponse?: CredentialResponse): OAuthCredentials | null {
    if (credentialsResponse?.credential) {
      const oauthCredentials: OAuthCredentials = jwtDecode(credentialsResponse.credential);
      const tokenExpiration = new Date(oauthCredentials.exp * 1000);
      if (tokenExpiration > new Date()) {
        return oauthCredentials;
      }
    }
    return null;
  }
  return credentials ? <Outlet /> : <Navigate to="/login" />;
}
