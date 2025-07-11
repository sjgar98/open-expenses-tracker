import { Outlet, Navigate } from 'react-router';
import { useState } from 'react';
import { useCookies } from 'react-cookie';
import type { CookieValues, AuthCredentials } from '../../model/auth';
import handleCredentialsResponse from '../../utils/handle-credentials-response';

export default function ProtectedRoute() {
  const [cookies] = useCookies<'oet_auth_jwt', CookieValues>(['oet_auth_jwt']);
  const [credentials] = useState<AuthCredentials | null>(handleCredentialsResponse(cookies?.oet_auth_jwt));
  return credentials ? <Outlet /> : <Navigate to="/login" />;
}
