import { useSnackbar } from 'notistack';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';
import type { RecurringIncomeDto, RecurringIncomeForm } from '../../../../model/income';
import { useForm } from '@mantine/form';
import { useQuery } from '@tanstack/react-query';
import { ApiService } from '../../../../services/api/api.service';
import { parseError } from '../../../../utils/error-parser.utils';
import { Box, Button, NumberInput, Select, Switch, Textarea, TextInput, Title } from '@mantine/core';
import { IconArrowBack, IconDeviceFloppy, IconRestore } from '@tabler/icons-react';
import { useState } from 'react';
import MaterialIcon from '../../../../components/MaterialIcon/MaterialIcon';
import RRuleGenerator from '../../../../components/RRuleGenerator/RRuleGenerator';

export default function NewIncomeRecurring() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const { onSubmit, key, getInputProps, reset } = useForm<RecurringIncomeForm>({
    mode: 'uncontrolled',
    initialValues: {
      description: '',
      amount: '0',
      currency: '',
      account: '',
      status: true,
      recurrenceRule: '',
    },
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { data: accounts } = useQuery({ queryKey: ['accounts'], queryFn: () => ApiService.getAccounts() });
  const { data: currencies } = useQuery({ queryKey: ['currencies'], queryFn: () => ApiService.getCurrencies() });

  function handleSubmit(data: RecurringIncomeForm) {
    if (!isSubmitting) {
      setIsSubmitting(true);
      const recurringIncomeDto: RecurringIncomeDto = {
        description: data.description,
        amount: parseFloat(data.amount),
        currency: currencies?.find((c) => c.code === data.currency)?.id ?? 0,
        account: data.account,
        status: data.status,
        recurrenceRule: data.recurrenceRule,
      };
      ApiService.createUserRecurringIncome(recurringIncomeDto)
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
              {t('income.recurring.new.title')}
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
                label={t('income.recurring.new.controls.description')}
                required
                disabled={isSubmitting}
              />
              <div className="container px-0">
                <div className="row mx-0 gap-3">
                  <div className="col-12 col-md-4 px-0">
                    <Select
                      key={key('currency')}
                      {...getInputProps('currency')}
                      label={t('income.recurring.new.controls.currency')}
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
                      label={t('income.recurring.new.controls.amount')}
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
                label={t('income.recurring.new.controls.account')}
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
              <Switch
                name="status"
                key={key('status')}
                {...getInputProps('status')}
                defaultChecked={true}
                label={t('income.recurring.new.controls.status')}
                disabled={isSubmitting}
              />
              <Textarea
                key={key('recurrenceRule')}
                {...getInputProps('recurrenceRule')}
                label={t('income.recurring.new.controls.recurrenceRule')}
                disabled={isSubmitting}
                required
                maxRows={2}
              />
              <RRuleGenerator />
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

