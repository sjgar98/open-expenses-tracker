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
import { ACCOUNT_ICONS } from '../../../constants/icons';
import Layout from '../../../components/Layout/Layout';
import { Box, Button, ColorInput, LoadingOverlay, NumberInput, Select, TextInput, Title, Tooltip } from '@mantine/core';
import { IconArrowBack, IconDeviceFloppy, IconRestore, IconTrash } from '@tabler/icons-react';
import MaterialIcon from '../../../components/MaterialIcon/MaterialIcon';
import { hasLength, isInRange, useForm } from '@mantine/form';

export default function EditAccount() {
  const { uuid } = useParams<{ uuid: string }>();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { enqueueSnackbar } = useSnackbar();
  const [initialState, setInitialState] = useState<Account | null>(null);
  const { onSubmit, key, getInputProps, reset, setInitialValues } = useForm<AccountForm>({
    mode: 'uncontrolled',
    initialValues: {
      name: initialState?.name ?? '',
      balance: String(initialState?.balance ?? ''),
      currency: initialState?.currency.code ?? '',
      icon: initialState?.icon ?? '',
      iconColor: initialState?.iconColor ?? '#FFFFFF',
    },
    validate: {
      name: hasLength({ min: 3 }),
      balance: isInRange({ min: 0 }),
      currency: hasLength({ min: 3, max: 3 }),
      icon: hasLength({ min: 1 }),
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
      setInitialValues({
        name: accountResponse.name,
        balance: String(accountResponse.balance),
        currency: accountResponse.currency.code,
        icon: accountResponse.icon,
        iconColor: accountResponse.iconColor,
      });
      reset();
      setIsLoading(false);
    }
  }, [accountResponse]);

  useEffect(() => {
    if (accountError) {
      enqueueSnackbar(t(parseError(accountError) ?? 'Error'), { variant: 'error' });
    }
  }, [accountError]);

  function handleSubmit(form: AccountForm) {
    const data: AccountDto = {
      name: form.name,
      balance: parseFloat(form.balance),
      currency: currencies.find((currency) => currency.code === form.currency)?.id ?? 0,
      icon: form.icon,
      iconColor: form.iconColor,
    };
    if (!isSubmitting) {
      setIsSubmitting(true);
      ApiService.updateAccount(uuid!, data)
        .then(() => {
          navigate('..');
        })
        .catch((error) => {
          setIsSubmitting(false);
          enqueueSnackbar(t(parseError(error) ?? 'Error'), { variant: 'error' });
        });
    }
  }

  function onReturn() {
    navigate('..');
  }

  function onDelete() {
    if (!isSubmitting) {
      setIsSubmitting(true);
      ApiService.deleteAccount(uuid!)
        .then(() => {
          navigate('..');
        })
        .catch((error) => {
          setIsSubmitting(false);
          enqueueSnackbar(t(parseError(error) ?? 'Error'), { variant: 'error' });
        });
    }
  }

  function onReset() {
    reset();
  }

  return (
    <>
      <Layout>
        {!isLoading && (
          <>
            <div className="container pt-3">
              <div className="row">
                <div className="col">
                  <div className="d-flex justify-content-start gap-3 pb-3">
                    <div className="d-flex gap-3">
                      <Button variant="subtle" color="blue" className="px-2" onClick={onReturn} disabled={isSubmitting}>
                        <Box className="d-flex align-items-center gap-2">
                          <IconArrowBack />
                          <span>{t('actions.return')}</span>
                        </Box>
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
              <div className="row">
                <div className="col-12">
                  <Title order={1} style={{ textAlign: 'center' }}>
                    {t('accounts.edit.title')}
                  </Title>
                </div>
              </div>
            </div>
            <div className="container py-3">
              <div className="row">
                <div className="col">
                  <form className="d-flex flex-column gap-3 my-2" onSubmit={onSubmit(handleSubmit)}>
                    <TextInput
                      key={key('name')}
                      {...getInputProps('name')}
                      label={t('accounts.edit.controls.name')}
                      required
                      disabled={isSubmitting}
                    />
                    <Select
                      key={key('currency')}
                      {...getInputProps('currency')}
                      label={t('accounts.edit.controls.currency')}
                      required
                      disabled={!currencies.length || isSubmitting}
                      data={currencies.map((currency) => ({
                        value: currency.code,
                        label: `(${currency.code}) ${currency.name}`,
                      }))}
                    />
                    <NumberInput
                      key={key('balance')}
                      {...getInputProps('balance')}
                      thousandSeparator
                      decimalScale={2}
                      valueIsNumericString
                      label={t('accounts.edit.controls.balance')}
                      required
                      disabled={isSubmitting}
                    />
                    <div className="container px-0">
                      <div className="row mx-0 gap-3">
                        <div className="col-12 col-md px-0">
                          <Select
                            key={key('icon')}
                            {...getInputProps('icon')}
                            label={t('accounts.edit.controls.icon')}
                            required
                            data={ACCOUNT_ICONS.map((icon) => ({ value: icon.icon, label: icon.label }))}
                            renderOption={(item) => (
                              <Box className="d-flex gap-2 align-items-center">
                                <MaterialIcon size={20}>{item.option.value}</MaterialIcon>
                                <span>{item.option.label}</span>
                              </Box>
                            )}
                          />
                        </div>
                        <div className="col-12 col-md px-0">
                          <ColorInput
                            key={key('iconColor')}
                            {...getInputProps('iconColor')}
                            label={t('accounts.edit.controls.iconColor')}
                            required
                            disabled={isSubmitting}
                          />
                        </div>
                      </div>
                    </div>
                    <div className="d-flex justify-content-between gap-3">
                      <div className="d-flex gap-3">
                        <Button
                          variant="subtle"
                          color="red"
                          className="px-2"
                          onClick={onDelete}
                          disabled={isSubmitting}
                        >
                          <Tooltip label={t('actions.delete')} withArrow>
                            <Box className="d-flex align-items-center gap-2">
                              <IconTrash />
                            </Box>
                          </Tooltip>
                        </Button>
                      </div>
                      <div className="d-flex gap-3">
                        <Button variant="outline" color="blue" onClick={onReset} disabled={isSubmitting}>
                          <Box className="d-flex align-items-center gap-2">
                            <IconRestore />
                            <span>{t('actions.reset')}</span>
                          </Box>
                        </Button>
                        <Button variant="filled" color="green" type="submit" disabled={isSubmitting}>
                          <Box className="d-flex align-items-center gap-2">
                            <IconDeviceFloppy />
                            <span>{t('actions.save')}</span>
                          </Box>
                        </Button>
                      </div>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </>
        )}
      </Layout>
      <LoadingOverlay visible={isLoading} zIndex={1000} loaderProps={{ size: 100, color: 'green' }} />
    </>
  );
}

