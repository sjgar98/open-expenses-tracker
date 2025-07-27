import Header from '../../components/Header/Header';
import { Box, Button, Paper, TextField, Typography } from '@mui/material';
import { useCookies } from 'react-cookie';
import type { CookieValues, LoginDto } from '../../model/auth';
import { useDispatch } from 'react-redux';
import { setCredentials } from '../../services/store/features/auth/authSlice';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';
import { useState } from 'react';
import { parseError } from '../../utils/error-parser.utils';
import { ApiService } from '../../services/api/api.service';
import { useSnackbar } from 'notistack';
import { Controller, useForm } from 'react-hook-form';
import LoginIcon from '@mui/icons-material/Login';
import PersonAddIcon from '@mui/icons-material/PersonAdd';

export default function Login() {
  const { t } = useTranslation();
  const [, setCookie] = useCookies<'oet_auth_jwt', CookieValues>(['oet_auth_jwt']);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { control, handleSubmit } = useForm<LoginDto>({
    defaultValues: {
      username: '',
      password: '',
    },
  });

  function onSubmit(data: LoginDto) {
    setIsSubmitting(true);
    ApiService.login(data)
      .then((credentialsResponse) => {
        setIsSubmitting(false);
        setCookie('oet_auth_jwt', credentialsResponse.access_token);
        dispatch(setCredentials(credentialsResponse.access_token));
        navigate('/');
      })
      .catch((error) => {
        setIsSubmitting(false);
        enqueueSnackbar(t(parseError(error) ?? 'Error'), { variant: 'error' });
      });
  }

  function onSignUp() {
    navigate('/signup');
  }

  return (
    <>
      <Header location="OpenExpensesTracker" />
      <Box sx={{ flexGrow: 1 }} className="d-flex flex-grow-1">
        <div className="container flex-grow-1 align-content-center">
          <div className="row justify-content-center mb-3">
            <div className="col-12 col-md-6">
              <Typography variant="h4" textAlign="center">
                {t('login.title')}
              </Typography>
            </div>
          </div>
          <div className="row justify-content-center">
            <div className="col-12 col-md-6">
              <Paper elevation={1} className="p-3">
                <form className="d-flex flex-column gap-3 my-2" onSubmit={handleSubmit(onSubmit)}>
                  <Controller
                    name="username"
                    control={control}
                    disabled={isSubmitting}
                    render={({ field }) => (
                      <TextField {...field} type="text" label={t('login.fields.username')} required />
                    )}
                  />
                  <Controller
                    name="password"
                    control={control}
                    disabled={isSubmitting}
                    render={({ field }) => (
                      <TextField {...field} type="password" label={t('login.fields.password')} required />
                    )}
                  />
                  <div className="d-flex justify-content-between gap-3">
                    <Button
                      color="primary"
                      className="d-flex gap-2"
                      sx={{ width: 'fit-content' }}
                      onClick={onSignUp}
                      disabled={isSubmitting}
                    >
                      <PersonAddIcon />
                      <span>{t('actions.register')}</span>
                    </Button>
                    <Button
                      color="success"
                      type="submit"
                      className="d-flex gap-2"
                      sx={{ width: 'fit-content' }}
                      disabled={isSubmitting}
                    >
                      <LoginIcon />
                      <span>{t('actions.login')}</span>
                    </Button>
                  </div>
                </form>
              </Paper>
            </div>
          </div>
        </div>
      </Box>
    </>
  );
}

