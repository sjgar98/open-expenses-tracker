import { useDispatch } from 'react-redux';
import AppRouting from './AppRouting';
import type { CookieValues } from './model/auth';
import { useCookies } from 'react-cookie';
import { setCredentials } from './services/store/features/auth/authSlice';
import handleCredentialsResponse from './utils/handle-credentials-response';

export default function App() {
  const [cookies] = useCookies<'g_oa_cr', CookieValues>(['g_oa_cr']);
  const dispatch = useDispatch();
  dispatch(setCredentials(handleCredentialsResponse(cookies?.g_oa_cr)));

  return (
    <>
      <AppRouting />
    </>
  );
}
