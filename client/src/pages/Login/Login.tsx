import type { LoginDto } from '../../model/auth';
import { useDispatch } from 'react-redux';
import { setCredentials } from '../../services/store/features/auth/authSlice';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';
import { useState } from 'react';
import { parseError } from '../../utils/error-parser.utils';
import { ApiService } from '../../services/api/api.service';
import { useSnackbar } from 'notistack';
import Layout from '../../components/Layout/Layout';
import { Box, Button, Paper, PasswordInput, TextInput, Title } from '@mantine/core';
import { useForm } from '@mantine/form';
import { IconLogin, IconUserPlus } from '@tabler/icons-react';

export default function Login() {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { onSubmit, key, getInputProps } = useForm<LoginDto>({
    mode: 'uncontrolled',
    initialValues: {
      username: '',
      password: '',
    },
  });

  function handleSubmit(data: LoginDto) {
    setIsSubmitting(true);
    ApiService.login(data)
      .then((credentialsResponse) => {
        setIsSubmitting(false);
        localStorage.setItem('oet_auth_jwt', credentialsResponse.access_token);
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
      <Layout>
        <div className="container flex-grow-1 align-content-center">
          <div className="row justify-content-center mb-3">
            <div className="col-12 col-md-6">
              <Title order={1} style={{ textAlign: 'center' }}>
                {t('login.title')}
              </Title>
            </div>
          </div>
          <div className="row justify-content-center">
            <div className="col-12 col-md-6">
              <Paper className="p-3">
                <form className="d-flex flex-column gap-3 my-2" onSubmit={onSubmit(handleSubmit)}>
                  <TextInput
                    key={key('username')}
                    {...getInputProps('username')}
                    type="text"
                    label={t('login.fields.username')}
                    required
                    disabled={isSubmitting}
                  />
                  <PasswordInput
                    key={key('password')}
                    {...getInputProps('password')}
                    label={t('login.fields.password')}
                    required
                    disabled={isSubmitting}
                  />
                  <div className="d-flex justify-content-between gap-3 mt-5">
                    <Button variant="outline" color="blue" onClick={onSignUp} disabled={isSubmitting}>
                      <Box className="d-flex align-items-center gap-2">
                        <IconUserPlus />
                        <span>{t('actions.register')}</span>
                      </Box>
                    </Button>
                    <Button variant="filled" color="green" type="submit" disabled={isSubmitting}>
                      <Box className="d-flex align-items-center gap-2">
                        <IconLogin />
                        <span>{t('actions.login')}</span>
                      </Box>
                    </Button>
                  </div>
                </form>
              </Paper>
            </div>
          </div>
        </div>
      </Layout>
    </>
  );
}

