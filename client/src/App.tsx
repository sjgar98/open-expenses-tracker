import { useDispatch } from 'react-redux';
import AppRouting from './AppRouting';
import type { CookieValues } from './model/auth';
import { useCookies } from 'react-cookie';
import { setCredentials } from './services/store/features/auth/authSlice';
import handleCredentialsResponse from './utils/handle-credentials-response';
import axios from 'axios';

export default function App() {
  const [cookies] = useCookies<'oet_auth_jwt', CookieValues>(['oet_auth_jwt']);
  const dispatch = useDispatch();
  dispatch(setCredentials(handleCredentialsResponse(cookies?.oet_auth_jwt)));

  axios.interceptors.request.use(function (config) {
    if (cookies.oet_auth_jwt) {
      config.headers['Authorization'] = `Bearer ${cookies.oet_auth_jwt}`;
    }
    return config;
  });

  return (
    <>
      <AppRouting />
    </>
  );
}
