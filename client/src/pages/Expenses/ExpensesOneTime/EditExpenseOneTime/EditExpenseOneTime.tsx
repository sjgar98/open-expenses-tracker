import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import type { Expense, ExpenseDto, ExpenseForm } from '../../../../model/expenses';
import { useTranslation } from 'react-i18next';
import { useSnackbar } from 'notistack';
import { useForm } from '@mantine/form';
import { DateTime } from 'luxon';
import { ApiService } from '../../../../services/api/api.service';
import { useQuery } from '@tanstack/react-query';
import { parseError } from '../../../../utils/error-parser.utils';
import { Box, Button, LoadingOverlay, MultiSelect, NumberInput, Select, TextInput, Title, Tooltip, } from '@mantine/core';
import { IconArrowBack, IconDeviceFloppy, IconRestore, IconTrash } from '@tabler/icons-react';
import MaterialIcon from '../../../../components/MaterialIcon/MaterialIcon';
import { DatePickerInput } from '@mantine/dates';

export default function EditExpenseOneTime() {
  const { uuid } = useParams<{ uuid: string }>();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const [initialState, setInitialState] = useState<Expense | null>(null);
  const { onSubmit, key, getInputProps, reset, setInitialValues } = useForm<ExpenseForm>({
    mode: 'uncontrolled',
    initialValues: {
      description: initialState?.description ?? '',
      amount: initialState ? String(initialState.amount) : '0',
      currency: initialState?.currency.code ?? '',
      paymentMethod: initialState?.paymentMethod.uuid ?? '',
      taxes: initialState?.taxes.map((t) => t.uuid) ?? [],
      date: initialState
        ? DateTime.fromISO(initialState.date).toFormat('yyyy-MM-dd')
        : DateTime.now().toFormat('yyyy-MM-dd'),
    },
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { data: currencies } = useQuery({ queryKey: ['currencies'], queryFn: () => ApiService.getCurrencies() });
  const { data: paymentMethods } = useQuery({
    queryKey: ['paymentMethods'],
    queryFn: () => ApiService.getUserPaymentMethods(),
  });
  const { data: taxes } = useQuery({ queryKey: ['taxes'], queryFn: () => ApiService.getUserTaxes() });
  const { error: expenseError, data: expenseResponse } = useQuery({
    queryKey: ['expense', uuid],
    queryFn: () => ApiService.getUserExpenseByUuid(uuid!),
  });

  useEffect(() => {
    if (expenseResponse) {
      setInitialState(expenseResponse);
      setInitialValues({
        description: expenseResponse.description,
        amount: String(expenseResponse.amount),
        currency: expenseResponse.currency.code,
        paymentMethod: expenseResponse.paymentMethod.uuid,
        taxes: expenseResponse.taxes.map((t) => t.uuid),
        date: DateTime.fromISO(expenseResponse.date).toFormat('yyyy-MM-dd'),
      });
      reset();
      setIsLoading(false);
    }
  }, [expenseResponse]);

  useEffect(() => {
    if (expenseError) {
      enqueueSnackbar(t(parseError(expenseError) ?? 'Error'), { variant: 'error' });
      navigate('..');
    }
  }, [expenseError]);

  function handleSubmit(data: ExpenseForm) {
    if (!isSubmitting) {
      console.log(data.date);
      const expenseDto: ExpenseDto = {
        description: data.description,
        amount: parseFloat(data.amount),
        currency: currencies?.find((c) => c.code === data.currency)?.id ?? 0,
        paymentMethod: data.paymentMethod,
        taxes: data.taxes,
        date: DateTime.fromFormat(data.date, 'yyyy-MM-dd').toISO()!,
      };
      setIsSubmitting(true);
      ApiService.updateUserExpense(uuid!, expenseDto)
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
      ApiService.deleteUserExpense(uuid!)
        .then(() => {
          navigate('..');
        })
        .catch((error) => {
          setIsSubmitting(false);
          enqueueSnackbar(t(parseError(error) ?? 'Error'), { variant: 'error' });
        });
    }
  }

  return (
    <>
      {!isLoading && (
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
                  {t('expenses.onetime.edit.title')}
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
                    label={t('expenses.onetime.edit.controls.description')}
                    required
                    disabled={isSubmitting}
                  />
                  <div className="container px-0">
                    <div className="row mx-0 gap-3">
                      <div className="col-12 col-md-4 px-0">
                        <Select
                          key={key('currency')}
                          {...getInputProps('currency')}
                          label={t('expenses.onetime.edit.controls.currency')}
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
                          label={t('expenses.onetime.edit.controls.amount')}
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
                          label={t('expenses.onetime.edit.controls.paymentMethod')}
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
                          label={t('expenses.onetime.edit.controls.taxes')}
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
                  <DatePickerInput
                    key={key('date')}
                    {...getInputProps('date')}
                    label={t('expenses.onetime.edit.controls.date')}
                    required
                    disabled={isSubmitting}
                    valueFormat="DD/MM/YYYY"
                  />
                  <div className="d-flex justify-content-between gap-3">
                    <div className="d-flex gap-3">
                      <Button variant="subtle" color="red" className="px-2" onClick={onDelete} disabled={isSubmitting}>
                        <Tooltip label={t('actions.delete')} withArrow>
                          <Box className="d-flex align-items-center gap-2">
                            <IconTrash />
                          </Box>
                        </Tooltip>
                      </Button>
                    </div>
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
      )}
      <LoadingOverlay visible={isLoading} zIndex={1000} loaderProps={{ size: 100, color: 'green' }} />
    </>
  );
}

