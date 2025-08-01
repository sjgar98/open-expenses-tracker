import { useForm } from '@mantine/form';
import { useSnackbar } from 'notistack';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';
import type { RecurringExpenseDto, RecurringExpenseForm } from '../../../../model/expenses';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ApiService } from '../../../../services/api/api.service';
import { parseError } from '../../../../utils/error-parser.utils';
import { Box, Button, MultiSelect, NumberInput, Select, Switch, Textarea, TextInput, Title } from '@mantine/core';
import { IconArrowBack, IconDeviceFloppy, IconRestore } from '@tabler/icons-react';
import MaterialIcon from '../../../../components/MaterialIcon/MaterialIcon';
import RRuleGenerator from '../../../../components/RRuleGenerator/RRuleGenerator';

export default function NewExpenseRecurring() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const { onSubmit, key, getInputProps, reset } = useForm<RecurringExpenseForm>({
    mode: 'uncontrolled',
    initialValues: {
      description: '',
      amount: '0',
      currency: '',
      paymentMethod: '',
      status: true,
      taxes: [],
      recurrenceRule: '',
    },
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { data: currencies } = useQuery({ queryKey: ['currencies'], queryFn: () => ApiService.getCurrencies() });
  const { data: paymentMethods } = useQuery({
    queryKey: ['paymentMethods'],
    queryFn: () => ApiService.getUserPaymentMethods(),
  });
  const { data: taxes } = useQuery({ queryKey: ['taxes'], queryFn: () => ApiService.getUserTaxes() });

  function handleSubmit(data: RecurringExpenseForm) {
    if (!isSubmitting) {
      const recurringExpenseDto: RecurringExpenseDto = {
        description: data.description,
        amount: parseFloat(data.amount),
        currency: currencies?.find((c) => c.code === data.currency)?.id ?? 0,
        paymentMethod: data.paymentMethod,
        status: data.status,
        taxes: data.taxes,
        recurrenceRule: data.recurrenceRule,
      };
      setIsSubmitting(true);
      ApiService.createUserExpenseRecurring(recurringExpenseDto)
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
              {t('expenses.recurring.new.title')}
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
                label={t('expenses.recurring.new.controls.description')}
                required
                disabled={isSubmitting}
              />
              <div className="container px-0">
                <div className="row mx-0 gap-3">
                  <div className="col-12 col-md-4 px-0">
                    <Select
                      key={key('currency')}
                      {...getInputProps('currency')}
                      label={t('expenses.recurring.new.controls.currency')}
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
                      label={t('expenses.recurring.new.controls.amount')}
                      allowNegative={false}
                      hideControls
                      required
                      disabled={isSubmitting}
                    />
                  </div>
                </div>
              </div>
              <div className="container px-0">
                <div className="row mx-0 gap-3">
                  <div className="col-12 col-md px-0">
                    <Select
                      key={key('paymentMethod')}
                      {...getInputProps('paymentMethod')}
                      label={t('expenses.recurring.new.controls.paymentMethod')}
                      required
                      disabled={!paymentMethods?.length || isSubmitting}
                      data={paymentMethods?.map((paymentMethod) => ({
                        value: paymentMethod.uuid,
                        label: paymentMethod.name,
                      }))}
                      renderOption={(item) => {
                        const option = paymentMethods!.find(
                          (paymentMethod) => paymentMethod.uuid === item.option.value
                        )!;
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
                  </div>
                  <div className="col-12 col-md px-0">
                    <MultiSelect
                      key={key('taxes')}
                      {...getInputProps('taxes')}
                      label={t('expenses.recurring.new.controls.taxes')}
                      required
                      disabled={!taxes?.length || isSubmitting}
                      data={taxes?.map((tax) => ({
                        value: tax.uuid,
                        label: `${tax.name} (${tax.rate}%)`,
                      }))}
                    />
                  </div>
                </div>
              </div>
              <Switch
                name="status"
                key={key('status')}
                {...getInputProps('status')}
                defaultChecked={true}
                label={t('expenses.recurring.new.controls.status')}
                disabled={isSubmitting}
              />
              <Textarea
                key={key('recurrenceRule')}
                {...getInputProps('recurrenceRule')}
                label={t('expenses.recurring.new.controls.recurrenceRule')}
                disabled={isSubmitting}
                required
                maxRows={2}
              />
              <RRuleGenerator />
              <div className="d-flex justify-content-end gap-3 mt-5">
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

