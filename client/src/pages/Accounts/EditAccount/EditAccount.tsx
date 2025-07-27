import { useDispatch, useSelector } from 'react-redux';
import type { AppState } from '../../../model/state';
import { useQuery } from '@tanstack/react-query';
import { ApiService } from '../../../services/api/api.service';
import { useEffect, useState } from 'react';
import { setCurrencies } from '../../../services/store/features/currencies/currenciesSlice';
import type { Account, AccountDto, AccountForm } from '../../../model/accounts';
import { parseError } from '../../../utils/error-parser.utils';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router';
import { useSnackbar } from 'notistack';
import { Controller, useForm } from 'react-hook-form';
import Header from '../../../components/Header/Header';
import { Backdrop, Box, Button, CircularProgress, MenuItem, TextField, Typography } from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import UndoIcon from '@mui/icons-material/Undo';
import DeleteIcon from '@mui/icons-material/Delete';

export default function EditAccount() {
  const { uuid } = useParams<{ uuid: string }>();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { enqueueSnackbar } = useSnackbar();
  const [initialState, setInitialState] = useState<Account | null>(null);
  const { control, handleSubmit, reset } = useForm<AccountForm>({
    defaultValues: {
      name: undefined,
      balance: undefined,
      currency: '',
    },
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const currencies = useSelector(({ currencies }: AppState) => currencies.currencies);

  const { data: currenciesResponse } = useQuery({
    queryKey: ['currencies'],
    queryFn: () => ApiService.getCurrencies(),
  });

  useEffect(() => {
    dispatch(setCurrencies(currenciesResponse ?? []));
  }, [currenciesResponse]);

  const { error: accountError, data: accountResponse } = useQuery({
    queryKey: ['accountByUuid', uuid],
    queryFn: () => ApiService.getAccountByUuid(uuid!),
  });

  useEffect(() => {
    if (accountResponse) {
      setInitialState(accountResponse);
      reset({
        name: accountResponse.name,
        balance: String(accountResponse.balance),
        currency: accountResponse.currency.code,
      });
      setIsLoading(false);
    }
  }, [accountResponse]);

  useEffect(() => {
    if (accountError) {
      enqueueSnackbar(t(parseError(accountError) ?? 'Error'), { variant: 'error' });
    }
  }, [accountError]);

  function onSubmit(form: AccountForm) {
    const data: AccountDto = {
      name: form.name,
      balance: parseFloat(form.balance),
      currency: currencies.find((currency) => currency.code === form.currency)?.id ?? 0,
    };
    if (!isSubmitting) {
      setIsSubmitting(true);
      ApiService.updateAccount(uuid!, data)
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

  function onDelete() {
    if (!isSubmitting) {
      setIsSubmitting(true);
      ApiService.deleteAccount(uuid!)
        .then(() => {
          navigate('/accounts');
        })
        .catch((error) => {
          setIsSubmitting(false);
          enqueueSnackbar(t(parseError(error) ?? 'Error'), { variant: 'error' });
        });
    }
  }

  function onReset() {
    reset({
      name: initialState?.name ?? '',
      balance: String(initialState?.balance ?? ''),
      currency: initialState?.currency.code ?? '',
    });
  }

  return (
    <>
      <Header location={t('accounts.title')} />
      {!isLoading && (
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
                  <div className="d-flex justify-content-between gap-3">
                    <div className="d-flex gap-3">
                      <Button
                        color="error"
                        className="d-flex gap-2"
                        sx={{ width: 'fit-content', minWidth: 'fit-content' }}
                        onClick={onDelete}
                        disabled={isSubmitting}
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
      )}
      <Backdrop sx={(theme) => ({ color: '#fff', zIndex: theme.zIndex.drawer + 1 })} open={isLoading}>
        <CircularProgress color="inherit" />
      </Backdrop>
    </>
  );
}

