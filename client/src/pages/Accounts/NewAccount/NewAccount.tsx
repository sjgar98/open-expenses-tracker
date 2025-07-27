import { useSnackbar } from 'notistack';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';
import type { AccountDto, AccountForm } from '../../../model/accounts';
import { Controller, useForm } from 'react-hook-form';
import { ApiService } from '../../../services/api/api.service';
import { parseError } from '../../../utils/error-parser.utils';
import Header from '../../../components/Header/Header';
import { Box, Button, MenuItem, TextField, Typography } from '@mui/material';
import type { AppState } from '../../../model/state';
import { useDispatch, useSelector } from 'react-redux';
import SaveIcon from '@mui/icons-material/Save';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import UndoIcon from '@mui/icons-material/Undo';
import { useQuery } from '@tanstack/react-query';
import { setCurrencies } from '../../../services/store/features/currencies/currenciesSlice';

export default function NewAccount() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { enqueueSnackbar } = useSnackbar();
  const { control, handleSubmit, reset } = useForm<AccountForm>({
    defaultValues: {
      name: undefined,
      balance: undefined,
      currency: '',
    },
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const currencies = useSelector(({ currencies }: AppState) => currencies.currencies);

  const { data: currenciesResponse } = useQuery({
    queryKey: ['currencies'],
    queryFn: () => ApiService.getCurrencies(),
  });
  useEffect(() => {
    dispatch(setCurrencies(currenciesResponse ?? []));
  }, [currenciesResponse]);

  function onSubmit(form: AccountForm) {
    const data: AccountDto = {
      name: form.name,
      balance: parseFloat(form.balance),
      currency: currencies.find((currency) => currency.code === form.currency)?.id ?? 0,
    };
    if (!isSubmitting) {
      setIsSubmitting(true);
      ApiService.createAccount(data)
        .then(() => {
          navigate('/accounts');
        })
        .catch((error) => {
          setIsSubmitting(false);
          enqueueSnackbar(t(parseError(error) ?? 'Error'), { variant: 'error' });
        });
    }
  }

  function onReturn() {
    navigate('/accounts');
  }

  function onReset() {
    reset({
      name: undefined,
      balance: undefined,
      currency: '',
    });
  }

  return (
    <>
      <Header location={t('accounts.title')} />
      <Box sx={{ flexGrow: 1 }}>
        <div className="container pt-5">
          <div className="row">
            <div className="col-12">
              <Typography variant="h4" textAlign="center">
                {t('accounts.new.title')}
              </Typography>
            </div>
          </div>
        </div>
        <div className="container py-3">
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
              <form className="d-flex flex-column gap-3 my-2" onSubmit={handleSubmit(onSubmit)}>
                <Controller
                  name="name"
                  control={control}
                  render={({ field }) => <TextField {...field} label={t('accounts.new.controls.name')} required />}
                />
                <Controller
                  name="balance"
                  control={control}
                  render={({ field }) => <TextField {...field} label={t('accounts.new.controls.balance')} required />}
                />
                <Controller
                  name="currency"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      select
                      label={t('accounts.new.controls.currency')}
                      required
                      disabled={!currencies.length}
                    >
                      {currencies
                        .filter((currency) => currency.visible)
                        .map((currency) => (
                          <MenuItem key={currency.id} value={currency.code}>
                            ({currency.code}) {currency.name}
                          </MenuItem>
                        ))}
                    </TextField>
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
                      disabled={isSubmitting}
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

