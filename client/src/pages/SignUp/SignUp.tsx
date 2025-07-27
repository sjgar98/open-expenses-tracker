import { useTranslation } from 'react-i18next';
import type { CookieValues, SignUpDto } from '../../model/auth';
import { useCookies } from 'react-cookie';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router';
import { Controller, useForm } from 'react-hook-form';
import { ApiService } from '../../services/api/api.service';
import { useSnackbar } from 'notistack';
import { parseError } from '../../utils/error-parser.utils';
import { setCredentials } from '../../services/store/features/auth/authSlice';
import Header from '../../components/Header/Header';
import { Box, Button, Paper, TextField, Typography } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useState } from 'react';
import PersonAddIcon from '@mui/icons-material/PersonAdd';

export default function SignUp() {
  const { t } = useTranslation();
  const [, setCookie] = useCookies<'oet_auth_jwt', CookieValues>(['oet_auth_jwt']);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { control, handleSubmit } = useForm<SignUpDto>({
    defaultValues: {
      username: '',
      password: '',
      repeatPassword: '',
      email: '',
    },
  });

  function onSubmit(data: SignUpDto) {
    setIsSubmitting(true);
    ApiService.register(data)
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

  function onReturn() {
    navigate('/login');
  }

  return (
    <>
      <Header location="OpenExpensesTracker" />
      <Box sx={{ flexGrow: 1 }} className="d-flex flex-grow-1">
        <div className="container flex-grow-1 align-content-center">
          <div className="row justify-content-center mb-3">
            <div className="col-12 col-md-6">
              <Typography variant="h4" textAlign="center">
                {t('register.title')}
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
                      <TextField {...field} type="text" label={t('register.fields.username')} required />
                    )}
                  />
                  <Controller
                    name="password"
                    control={control}
                    disabled={isSubmitting}
                    render={({ field }) => (
                      <TextField {...field} type="password" label={t('register.fields.password')} required />
                    )}
                  />
                  <Controller
                    name="repeatPassword"
                    control={control}
                    disabled={isSubmitting}
                    render={({ field }) => (
                      <TextField {...field} type="password" label={t('register.fields.repeatPassword')} required />
                    )}
                  />
                  <Controller
                    name="email"
                    control={control}
                    disabled={isSubmitting}
                    render={({ field }) => <TextField {...field} type="email" label={t('register.fields.email')} />}
                  />
                  <div className="d-flex justify-content-between gap-3">
                    <Button
                      color="primary"
                      className="d-flex gap-2"
                      sx={{ width: 'fit-content' }}
                      onClick={onReturn}
                      disabled={isSubmitting}
                    >
                      <ArrowBackIcon />
                      <span>{t('actions.return')}</span>
                    </Button>
                    <Button
                      color="success"
                      type="submit"
                      className="d-flex gap-2"
                      sx={{ width: 'fit-content' }}
                      disabled={isSubmitting}
                    >
                      <PersonAddIcon />
                      <span>{t('actions.register')}</span>
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

