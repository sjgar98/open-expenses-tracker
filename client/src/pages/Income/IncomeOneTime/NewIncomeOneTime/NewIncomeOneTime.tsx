import { useSnackbar } from 'notistack';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';
import type { IncomeDto, IncomeForm } from '../../../../model/income';
import { ApiService } from '../../../../services/api/api.service';
import { useState } from 'react';
import { parseError } from '../../../../utils/error-parser.utils';
import { useQuery } from '@tanstack/react-query';
import { DateTime } from 'luxon';
import { useForm } from '@mantine/form';
import { Box, Button, NumberInput, Select, TextInput, Title } from '@mantine/core';
import { IconArrowBack, IconDeviceFloppy, IconRestore } from '@tabler/icons-react';
import MaterialIcon from '../../../../components/MaterialIcon/MaterialIcon';
import { DatePickerInput } from '@mantine/dates';

export default function NewIncomeOneTime() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const { onSubmit, key, getInputProps, reset } = useForm<IncomeForm>({
    mode: 'uncontrolled',
    initialValues: {
      description: '',
      amount: '0',
      currency: '',
      account: '',
      date: DateTime.now(),
    },
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { data: accounts } = useQuery({ queryKey: ['accounts'], queryFn: () => ApiService.getAccounts() });
  const { data: currencies } = useQuery({ queryKey: ['currencies'], queryFn: () => ApiService.getCurrencies() });

  function handleSubmit(data: IncomeForm) {
    if (!isSubmitting) {
      const incomeDto: IncomeDto = {
        description: data.description,
        amount: parseFloat(data.amount),
        currency: currencies?.find((c) => c.code === data.currency)?.id ?? 0,
        account: data.account,
        date: data.date.toISO()!,
      };
      setIsSubmitting(true);
      ApiService.createUserIncome(incomeDto)
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
    <Box className="flex-grow-1">
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
              {t('income.onetime.new.title')}
            </Title>
          </div>
        </div>
      </div>
      <div className="container py-3">
        <div className="row">
          <div className="col">
            <form className="d-flex flex-column gap-3 my-2" onSubmit={onSubmit(handleSubmit)}>
              <TextInput
                key={key('description')}
                {...getInputProps('description')}
                label={t('income.onetime.new.controls.description')}
                required
                disabled={isSubmitting}
              />
              <div className="container px-0">
                <div className="row mx-0 gap-3">
                  <div className="col-12 col-md-4 px-0">
                    <Select
                      key={key('currency')}
                      {...getInputProps('currency')}
                      label={t('income.onetime.new.controls.currency')}
                      required
                      disabled={!currencies?.length || isSubmitting}
                      data={currencies
                        ?.filter((currency) => currency.visible)
                        .map((currency) => ({
                          value: currency.code,
                          label: `(${currency.code}) ${currency.name}`,
                        }))}
                    />
                  </div>
                  <div className="col-12 col-md px-0">
                    <NumberInput
                      key={key('amount')}
                      {...getInputProps('amount')}
                      thousandSeparator
                      decimalScale={2}
                      valueIsNumericString
                      label={t('income.onetime.new.controls.amount')}
                      allowNegative={false}
                      hideControls
                      required
                      disabled={isSubmitting}
                    />
                  </div>
                </div>
              </div>
              <Select
                key={key('account')}
                {...getInputProps('account')}
                label={t('income.onetime.new.controls.account')}
                required
                disabled={!accounts?.length || isSubmitting}
                data={accounts?.map((account) => ({
                  value: account.uuid,
                  label: account.name,
                }))}
                renderOption={(item) => {
                  const option = accounts!.find((account) => account.uuid === item.option.value)!;
                  return (
                    <Box className="d-flex align-items-center gap-1">
                      <MaterialIcon color={option.iconColor} size={20}>
                        {option.icon}
                      </MaterialIcon>
                      <span>{option.name}</span>
                    </Box>
                  );
                }}
              />
              <DatePickerInput
                key={key('date')}
                {...getInputProps('date')}
                label={t('income.onetime.new.controls.date')}
                required
                disabled={isSubmitting}
                valueFormat="DD/MM/YYYY"
              />
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
    </Box>
  );
}

