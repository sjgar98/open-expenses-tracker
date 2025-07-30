import { useSnackbar } from 'notistack';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';
import type { AccountDto, AccountForm } from '../../../model/accounts';
import { ApiService } from '../../../services/api/api.service';
import { parseError } from '../../../utils/error-parser.utils';
import type { AppState } from '../../../model/state';
import { useDispatch, useSelector } from 'react-redux';
import { useQuery } from '@tanstack/react-query';
import { setCurrencies } from '../../../services/store/features/currencies/currenciesSlice';
import { ACCOUNT_ICONS } from '../../../constants/icons';
import Layout from '../../../components/Layout/Layout';
import { Box, Button, ColorInput, NumberInput, Select, TextInput, Title } from '@mantine/core';
import { IconArrowBack, IconDeviceFloppy, IconRestore } from '@tabler/icons-react';
import MaterialIcon from '../../../components/MaterialIcon/MaterialIcon';
import { hasLength, isInRange, useForm } from '@mantine/form';

export default function NewAccount() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { enqueueSnackbar } = useSnackbar();

  const { onSubmit, key, getInputProps, reset } = useForm<AccountForm>({
    mode: 'uncontrolled',
    initialValues: {
      name: '',
      balance: '',
      currency: '',
      icon: '',
      iconColor: '#FFFFFF',
    },
    validate: {
      name: hasLength({ min: 3 }),
      balance: isInRange({ min: 0 }),
      currency: hasLength({ min: 3, max: 3 }),
      icon: hasLength({ min: 1 }),
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
      ApiService.createAccount(data)
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

  return (
    <>
      <Layout>
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
                {t('accounts.new.title')}
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
                  label={t('accounts.new.controls.name')}
                  required
                  disabled={isSubmitting}
                />
                <Select
                  key={key('currency')}
                  {...getInputProps('currency')}
                  label={t('accounts.new.controls.currency')}
                  required
                  disabled={!currencies.length || isSubmitting}
                  data={currencies
                    .filter((currency) => currency.visible)
                    .map((currency) => ({
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
                  label={t('accounts.new.controls.balance')}
                  required
                  disabled={isSubmitting}
                />
                <div className="container px-0">
                  <div className="row mx-0 gap-3">
                    <div className="col-12 col-md px-0">
                      <Select
                        key={key('icon')}
                        {...getInputProps('icon')}
                        label={t('accounts.new.controls.icon')}
                        required
                        data={ACCOUNT_ICONS.map((icon) => ({ value: icon.icon, label: icon.label }))}
                        renderOption={(item) => (
                          <>
                            <Box className="d-flex gap-2 align-items-center">
                              <MaterialIcon size={20}>{item.option.value}</MaterialIcon>
                              <span>{item.option.label}</span>
                            </Box>
                          </>
                        )}
                      />
                    </div>
                    <div className="col-12 col-md px-0">
                      <ColorInput
                        key={key('iconColor')}
                        {...getInputProps('iconColor')}
                        label={t('accounts.new.controls.iconColor')}
                        required
                        disabled={isSubmitting}
                      />
                    </div>
                  </div>
                </div>
                <div className="d-flex justify-content-end gap-3">
                  <div className="d-flex gap-3">
                    <Button variant="outline" color="blue" onClick={reset} disabled={isSubmitting}>
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
      </Layout>
    </>
  );
}

