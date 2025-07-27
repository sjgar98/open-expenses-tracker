import { Outlet, Navigate } from 'react-router';
import type { AuthState } from '../../model/auth';
import { useSelector } from 'react-redux';

export default function ProtectedRoute() {
  const credentials = useSelector(({ auth }: { auth: AuthState }) => auth.credentials);
  return credentials ? <Outlet /> : <Navigate to="/login" />;
}

