import Header from '../../components/Header/Header';
import { Box, Button, Paper, TextField, Typography } from '@mui/material';
// import { GoogleLogin } from '@react-oauth/google';
import { useCookies } from 'react-cookie';
import type { CookieValues, CredentialResponse } from '../../model/auth';
import { useDispatch, useSelector } from 'react-redux';
import { setCredentials } from '../../services/store/features/auth/authSlice';
import handleCredentialsResponse from '../../utils/handle-credentials-response';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';
import axios from 'axios';
import { useState } from 'react';
import { parseError } from '../../utils/error-parser.utils';
import { ApiService } from '../../services/api/api.service';

export default function Login() {
  const { t } = useTranslation();
  const [cookies, setCookie] = useCookies<'oet_auth_jwt', CookieValues>(['oet_auth_jwt']);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const selectedLanguage: string = useSelector((state: any) => state.lang.selectedLanguage);

  const [loginError, setLoginError] = useState<string | null>(null);
  const [isSignUpOpen, setSignUpOpen] = useState(false);
  const [isSubmitting, setSubmitting] = useState(false);
  const [signUpError, setSignUpError] = useState<string | null>(null);

  function handleLogin(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const body = {
      username: formData.get('username') as string,
      password: formData.get('password') as string,
    };

    ApiService.login(body)
      .then((credentialsResponse) => {
        setCookie('oet_auth_jwt', credentialsResponse.access_token);
        dispatch(setCredentials(handleCredentialsResponse(cookies!.oet_auth_jwt!)));
        navigate('/');
      })
      .catch((error) => {
        setSignUpError(parseError(error));
      });
  }

  function handleOpenSignUp() {
    setSignUpOpen(true);
    setLoginError(null);
    setSignUpError(null);
  }

  function handleSignUp(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const body: any = {
      username: formData.get('username') as string,
      password: formData.get('password') as string,
      repeatPassword: formData.get('repeatPassword') as string,
      email: formData.get('email') as string,
    };
    if (body.password !== body.repeatPassword) {
      setSignUpError('register.errors.passwordMismatch');
      return;
    }
    setSubmitting(true);
    ApiService.register(body)
      .then((credentialsResponse) => {
        setSubmitting(false);
        setCookie('oet_auth_jwt', credentialsResponse.access_token);
        dispatch(setCredentials(handleCredentialsResponse(cookies!.oet_auth_jwt!)));
        navigate('/');
      })
      .catch((error) => {
        setSubmitting(false);
        setSignUpError(parseError(error));
      });
  }

  function handleGoBack() {
    setSignUpOpen(false);
    setLoginError(null);
    setSignUpError(null);
  }

  return (
    <>
      <Header location="OpenExpensesTracker" />
      <Box sx={{ flexGrow: 1, alignItems: 'center', display: 'flex', justifyContent: 'center' }}>
        <Paper
          sx={{
            p: 3,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 2,
            width: '100%',
            maxWidth: '500px',
          }}
        >
          <Typography variant="h4" component="div" sx={{ flexGrow: 1 }}>
            {t('login.title')}
          </Typography>
          {!isSignUpOpen ? (
            <>
              <form onSubmit={handleLogin} className="d-flex flex-column gap-3 w-100">
                <TextField type="text" name="username" label={t('login.fields.username')} required />
                <TextField type="password" name="password" label={t('login.fields.password')} required />
                <Button color="success" type="submit" disabled={isSubmitting}>
                  {t('login.actions.login')}
                </Button>
                <Button color="primary" onClick={handleOpenSignUp} disabled={isSubmitting}>
                  {t('login.actions.register')}
                </Button>
                {loginError && (
                  <Typography color="error" className="text-center">
                    {t(loginError)}
                  </Typography>
                )}
              </form>
            </>
          ) : (
            <>
              <form onSubmit={handleSignUp} className="d-flex flex-column gap-3 w-100">
                <TextField
                  type="text"
                  name="username"
                  label={t('register.fields.username')}
                  required
                  error={['register.errors.usernameTaken'].includes(signUpError ?? '')}
                />
                <TextField
                  type="password"
                  name="password"
                  label={t('register.fields.password')}
                  required
                  error={['register.errors.passwordComposition'].includes(signUpError ?? '')}
                />
                <TextField
                  type="password"
                  name="repeatPassword"
                  label={t('register.fields.repeatPassword')}
                  required
                  error={['register.errors.passwordMismatch'].includes(signUpError ?? '')}
                />
                <TextField
                  type="email"
                  name="email"
                  label={t('register.fields.email')}
                  error={['register.errors.emailTaken'].includes(signUpError ?? '')}
                />
                <Button color="success" type="submit" disabled={isSubmitting}>
                  {t('register.actions.register')}
                </Button>
                <Button color="primary" onClick={handleGoBack} disabled={isSubmitting}>
                  {t('register.actions.goback')}
                </Button>
                {signUpError && (
                  <Typography color="error" className="text-center">
                    {t(signUpError)}
                  </Typography>
                )}
              </form>
            </>
          )}
        </Paper>
      </Box>
    </>
  );
}
