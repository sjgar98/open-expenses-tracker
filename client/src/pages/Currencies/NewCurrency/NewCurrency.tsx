import { useSnackbar } from 'notistack';
import { Controller, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';
import type { CurrencyDto } from '../../../model/currencies';
import { ApiService } from '../../../services/api/api.service';
import { parseError } from '../../../utils/error-parser.utils';
import { useState } from 'react';
import Header from '../../../components/Header/Header';
import { Box, Button, FormControlLabel, Switch, TextField, Typography } from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import UndoIcon from '@mui/icons-material/Undo';
import { useSelector } from 'react-redux';
import type { AppState } from '../../../model/state';

export default function NewCurrency() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const { control, handleSubmit, reset } = useForm<CurrencyDto>({
    defaultValues: {
      name: '',
      code: '',
      visible: true,
    },
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isAdmin = useSelector(({ auth }: AppState) => Boolean(auth.credentials?.isAdmin));

  function onSubmit(data: CurrencyDto) {
    if (!isSubmitting) {
      setIsSubmitting(true);
      ApiService.saveNewCurrency(data)
        .then(() => {
          navigate('/currencies');
        })
        .catch((error) => {
          setIsSubmitting(false);
          enqueueSnackbar(t(parseError(error) ?? 'Error'), { variant: 'error' });
        });
    }
  }

  function onReturn() {
    navigate('/currencies');
  }

  function onReset() {
    reset({
      name: '',
      code: '',
      visible: true,
    });
  }

  return (
    <>
      <Header location={t('currencies.title')} />
      <Box sx={{ flexGrow: 1 }}>
        <div className="container pt-3">
          <div className="row">
            <div className="col">
              <div className="d-flex justify-content-start gap-3 pb-3">
                <div className="d-flex gap-3">
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
                </div>
              </div>
            </div>
          </div>
          <div className="row">
            <div className="col-12">
              <Typography variant="h4" textAlign="center">
                {t('currencies.new.title')}
              </Typography>
            </div>
          </div>
        </div>
        <div className="container py-3">
          <div className="row">
            <div className="col">
              <form className="d-flex flex-column gap-3 my-2" onSubmit={handleSubmit(onSubmit)}>
                <Controller
                  name="name"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label={t('currencies.new.controls.name')}
                      variant="outlined"
                      required
                      disabled={isSubmitting}
                    />
                  )}
                />
                <Controller
                  name="code"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label={t('currencies.new.controls.code')}
                      variant="outlined"
                      required
                      disabled={isSubmitting}
                    />
                  )}
                />

                <Controller
                  name="visible"
                  control={control}
                  render={({ field }) => (
                    <FormControlLabel
                      control={<Switch {...field} checked={field.value} />}
                      label={t('currencies.new.controls.visible')}
                      disabled={isSubmitting}
                    />
                  )}
                />
                <div className="d-flex justify-content-end gap-3">
                  <div className="d-flex gap-3">
                    <Button
                      color="primary"
                      className="d-flex gap-2"
                      sx={{ width: 'fit-content' }}
                      onClick={onReset}
                      disabled={isSubmitting}
                    >
                      <UndoIcon />
                      <span>{t('actions.reset')}</span>
                    </Button>
                    <Button
                      color="success"
                      type="submit"
                      className="d-flex gap-2"
                      sx={{ width: 'fit-content' }}
                      disabled={isSubmitting || !isAdmin}
                    >
                      <SaveIcon />
                      <span>{t('actions.save')}</span>
                    </Button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </Box>
    </>
  );
}

