import { useSnackbar } from 'notistack';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';
import type { AccountDto, AccountForm } from '../../../model/accounts';
import { Controller, useForm } from 'react-hook-form';
import { ApiService } from '../../../services/api/api.service';
import { parseError } from '../../../utils/error-parser.utils';
import Header from '../../../components/Header/Header';
import { Box, Button, Icon, MenuItem, TextField, Typography } from '@mui/material';
import type { AppState } from '../../../model/state';
import { useDispatch, useSelector } from 'react-redux';
import SaveIcon from '@mui/icons-material/Save';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import UndoIcon from '@mui/icons-material/Undo';
import { useQuery } from '@tanstack/react-query';
import { setCurrencies } from '../../../services/store/features/currencies/currenciesSlice';
import { MuiColorInput } from 'mui-color-input';
import { ACCOUNT_ICONS } from '../../../constants/icons';
import { NumericFormat } from 'react-number-format';

export default function NewAccount() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { enqueueSnackbar } = useSnackbar();
  const { control, handleSubmit, reset } = useForm<AccountForm>({
    defaultValues: {
      name: '',
      balance: '',
      currency: '',
      icon: '',
      iconColor: '#FFFFFF',
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
      icon: form.icon,
      iconColor: form.iconColor,
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
      name: '',
      balance: '',
      currency: '',
      icon: '',
      iconColor: '#FFFFFF',
    });
  }

  return (
    <>
      <Header location={t('accounts.title')} />
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
                {t('accounts.new.title')}
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
                    <TextField {...field} label={t('accounts.new.controls.name')} required disabled={isSubmitting} />
                  )}
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
                      disabled={!currencies.length || isSubmitting}
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
                <Controller
                  name="balance"
                  control={control}
                  rules={{ required: true }}
                  render={({ field: { value, onChange }, fieldState }) => (
                    <NumericFormat
                      {...{ value }}
                      onValueChange={({ floatValue }) => onChange(floatValue)}
                      customInput={TextField}
                      thousandSeparator
                      decimalScale={2}
                      valueIsNumericString
                      label={t('accounts.new.controls.balance')}
                      required
                      disabled={isSubmitting}
                      error={fieldState.invalid}
                    />
                  )}
                />
                <div className="container px-0">
                  <div className="row mx-0 gap-3">
                    <div className="col-12 col-md px-0">
                      <Controller
                        name="icon"
                        control={control}
                        rules={{ required: true }}
                        render={({ field, fieldState }) => (
                          <TextField
                            fullWidth
                            {...field}
                            select
                            label={t('accounts.new.controls.icon')}
                            required
                            disabled={isSubmitting}
                            error={fieldState.invalid}
                          >
                            {ACCOUNT_ICONS.map((icon) => (
                              <MenuItem key={icon.icon} value={icon.icon}>
                                <Box sx={{ display: 'flex', gap: 2 }}>
                                  <Icon>{icon.icon}</Icon>
                                  <span>{icon.label}</span>
                                </Box>
                              </MenuItem>
                            ))}
                          </TextField>
                        )}
                      />
                    </div>
                    <div className="col-12 col-md px-0">
                      <Controller
                        name="iconColor"
                        control={control}
                        rules={{ validate: (value) => /^#([0-9A-F]{3}){1,2}$/i.test(value) }}
                        render={({ field, fieldState }) => (
                          <MuiColorInput
                            fullWidth
                            {...field}
                            label={t('accounts.new.controls.iconColor')}
                            required
                            format="hex"
                            disabled={isSubmitting}
                            error={fieldState.invalid}
                            helperText={fieldState.error?.message}
                          />
                        )}
                      />
                    </div>
                  </div>
                </div>
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

