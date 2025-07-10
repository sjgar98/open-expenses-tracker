import Header from '../../components/Header/Header';
import { Box, Paper, Typography } from '@mui/material';
import { GoogleLogin, type CredentialResponse } from '@react-oauth/google';
import { useCookies } from 'react-cookie';
import type { CookieValues } from '../../model/auth';
import { useDispatch, useSelector } from 'react-redux';
import { setCredentials } from '../../services/store/features/auth/authSlice';
import handleCredentialsResponse from '../../utils/handle-credentials-response';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';

export default function Login() {
  const { t } = useTranslation();
  const [cookies, setCookie] = useCookies<'g_oa_cr', CookieValues>(['g_oa_cr']);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const selectedLanguage: string = useSelector((state: any) => state.lang.selectedLanguage);

  function handleLogin(credentialsResponse: CredentialResponse) {
    setCookie('g_oa_cr', credentialsResponse);
    dispatch(setCredentials(handleCredentialsResponse(cookies?.g_oa_cr)));
    navigate('/');
  }

  return (
    <>
      <Header location="OpenExpensesTracker" />
      <Box sx={{ flexGrow: 1, alignItems: 'center', display: 'flex', justifyContent: 'center' }}>
        <Paper sx={{ p: 3, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            {t('login.loginPrompt')}
          </Typography>
          <GoogleLogin
            locale={selectedLanguage ?? navigator.language}
            type="standard"
            onSuccess={handleLogin}
            onError={() => {}}
            auto_select
          />
        </Paper>
      </Box>
    </>
  );
}
