import { useDispatch, useSelector } from 'react-redux';
import AppRouting from './AppRouting';
import type { AuthState, CookieValues } from './model/auth';
import { useCookies } from 'react-cookie';
import { setCredentials } from './services/store/features/auth/authSlice';
import axios from 'axios';

export default function App() {
  const [cookies] = useCookies<'oet_auth_jwt', CookieValues>(['oet_auth_jwt']);
  const dispatch = useDispatch();
  dispatch(setCredentials(cookies?.oet_auth_jwt));
  const authToken = useSelector(({ auth }: { auth: AuthState }) => auth.token);

  axios.interceptors.request.use(function (config) {
    if (authToken) {
      config.headers['Authorization'] = `Bearer ${authToken}`;
    }
    return config;
  });

  return (
    <>
      <AppRouting />
    </>
  );
}

