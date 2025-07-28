import { useSnackbar } from 'notistack';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router';
import type { Currency, CurrencyDto } from '../../../model/currencies';
import { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { ApiService } from '../../../services/api/api.service';
import { useQuery } from '@tanstack/react-query';
import { parseError } from '../../../utils/error-parser.utils';
import Header from '../../../components/Header/Header';
import { Backdrop, Box, Button, CircularProgress, FormControlLabel, Switch, TextField, Typography, } from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import UndoIcon from '@mui/icons-material/Undo';
import DeleteIcon from '@mui/icons-material/Delete';
import { useSelector } from 'react-redux';
import type { AppState } from '../../../model/state';

export default function EditCurrency() {
  const { id } = useParams<{ id: string }>();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const [initialState, setInitialState] = useState<Currency | null>(null);
  const { control, handleSubmit, reset } = useForm<CurrencyDto>({
    defaultValues: {
      name: '',
      code: '',
      visible: true,
    },
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isAdmin = useSelector(({ auth }: AppState) => Boolean(auth.credentials?.isAdmin));

  const { error: currencyError, data: currencyResponse } = useQuery({
    queryKey: ['currencyById', id],
    queryFn: () => ApiService.getCurrencyById(id!),
  });

  useEffect(() => {
    if (currencyResponse) {
      setInitialState(currencyResponse);
      reset({
        name: currencyResponse.name,
        code: currencyResponse.code,
        visible: currencyResponse.visible,
      });
      setIsLoading(false);
    }
  }, [currencyResponse]);

  useEffect(() => {
    if (currencyError) {
      enqueueSnackbar(t(parseError(currencyError) ?? 'Error'), { variant: 'error' });
    }
  }, [currencyError]);

  function onSubmit(data: CurrencyDto) {
    if (!isSubmitting) {
      setIsSubmitting(true);
      ApiService.updateCurrency(Number(id!), data)
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

  function onDelete() {
    if (!isSubmitting) {
      setIsSubmitting(true);
      ApiService.deleteCurrency(Number(id!))
        .then(() => {
          navigate('/currencies');
        })
        .catch((error) => {
          setIsSubmitting(false);
          enqueueSnackbar(t(parseError(error) ?? 'Error'), { variant: 'error' });
        });
    }
  }

  function onReset() {
    reset({
      name: initialState?.name || '',
      code: initialState?.code || '',
      visible: initialState?.visible || true,
    });
  }

  return (
    <>
      <Header location={t('currencies.title')} />
      {!isLoading && (
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
                  {t('currencies.edit.title')}
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
                  <div className="d-flex justify-content-between gap-3">
                    <div className="d-flex gap-3">
                      <Button
                        color="error"
                        className="d-flex gap-2"
                        sx={{ width: 'fit-content', minWidth: 'fit-content' }}
                        onClick={onDelete}
                        disabled={isSubmitting || !isAdmin}
                      >
                        <DeleteIcon />
                      </Button>
                    </div>
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
      )}
      <Backdrop sx={(theme) => ({ color: '#fff', zIndex: theme.zIndex.drawer + 1 })} open={isLoading}>
        <CircularProgress color="inherit" />
      </Backdrop>
    </>
  );
}

