import { useForm } from '@mantine/form';
import { useSnackbar } from 'notistack';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router';
import type { RecurringExpense, RecurringExpenseDto, RecurringExpenseForm } from '../../../../model/expenses';
import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ApiService } from '../../../../services/api/api.service';
import { parseError } from '../../../../utils/error-parser.utils';
import { Box, Button, LoadingOverlay, MultiSelect, NumberInput, Select, Switch, Textarea, TextInput, Title, Tooltip, } from '@mantine/core';
import { IconArrowBack, IconDeviceFloppy, IconRestore, IconTrash } from '@tabler/icons-react';
import MaterialIcon from '../../../../components/MaterialIcon/MaterialIcon';
import RRuleGenerator from '../../../../components/RRuleGenerator/RRuleGenerator';

export default function EditExpenseRecurring() {
  const { uuid } = useParams();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const [initialState, setInitialState] = useState<RecurringExpense | null>(null);
  const { onSubmit, key, getInputProps, reset, setInitialValues } = useForm<RecurringExpenseForm>({
    mode: 'uncontrolled',
    initialValues: {
      description: initialState?.description || '',
      amount: initialState?.amount.toString() || '0',
      currency: initialState?.currency.code || '',
      paymentMethod: initialState?.paymentMethod?.uuid || '',
      category: initialState?.category?.uuid || '',
      status: initialState?.status || true,
      taxes: initialState?.taxes.map((t) => t.uuid) || [],
      recurrenceRule: initialState?.recurrenceRule || '',
    },
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { data: currencies } = useQuery({ queryKey: ['currencies'], queryFn: () => ApiService.getCurrencies() });
  const { data: paymentMethods } = useQuery({
    queryKey: ['paymentMethods'],
    queryFn: () => ApiService.getUserPaymentMethods(),
  });
  const { data: expenseCategories } = useQuery({
    queryKey: ['expenseCategories'],
    queryFn: () => ApiService.getExpenseCategories(),
  });
  const { data: taxes } = useQuery({ queryKey: ['taxes'], queryFn: () => ApiService.getUserTaxes() });
  const { error: expenseRecurringError, data: expenseRecurringResponse } = useQuery({
    queryKey: ['recurringExpense', uuid],
    queryFn: () => ApiService.getUserExpenseRecurringByUuid(uuid!),
  });

  useEffect(() => {
    if (expenseRecurringResponse) {
      setInitialState(expenseRecurringResponse);
      setInitialValues({
        description: expenseRecurringResponse.description,
        amount: expenseRecurringResponse.amount.toString(),
        currency: expenseRecurringResponse.currency.code,
        paymentMethod: expenseRecurringResponse.paymentMethod?.uuid ?? '',
        category: expenseRecurringResponse.category?.uuid ?? '',
        status: expenseRecurringResponse.status,
        taxes: expenseRecurringResponse.taxes.map((t) => t.uuid),
        recurrenceRule: expenseRecurringResponse.recurrenceRule,
      });
      reset();
      setIsLoading(false);
    }
  }, [expenseRecurringResponse]);

  useEffect(() => {
    if (expenseRecurringError) {
      enqueueSnackbar(t(parseError(expenseRecurringError) ?? 'Error'), { variant: 'error' });
    }
  }, [expenseRecurringError]);

  function handleSubmit(data: RecurringExpenseForm) {
    if (!isSubmitting) {
      setIsSubmitting(true);
      const recurringExpenseDto: RecurringExpenseDto = {
        description: data.description,
        amount: parseFloat(data.amount),
        currency: currencies?.find((c) => c.code === data.currency)?.id ?? 0,
        paymentMethod: data.paymentMethod,
        category: data.category,
        status: data.status,
        taxes: data.taxes,
        recurrenceRule: data.recurrenceRule,
      };
      ApiService.updateUserExpenseRecurring(uuid!, recurringExpenseDto)
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
      ApiService.deleteUserExpenseRecurring(uuid!)
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
                  {t('expenses.recurring.edit.title')}
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
                    label={t('expenses.recurring.edit.controls.description')}
                    required
                    disabled={isSubmitting}
                  />
                  <div className="container px-0">
                    <div className="row mx-0 gap-3">
                      <div className="col-12 col-md-4 px-0">
                        <Select
                          key={key('currency')}
                          {...getInputProps('currency')}
                          label={t('expenses.recurring.edit.controls.currency')}
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
                          label={t('expenses.recurring.edit.controls.amount')}
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
                          label={t('expenses.recurring.edit.controls.paymentMethod')}
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
                          label={t('expenses.recurring.edit.controls.taxes')}
                          required
                          disabled={!taxes?.length || isSubmitting}
                          data={taxes?.map((tax) => ({
                            value: tax.uuid,
                            label: `${tax.name} (${tax.rate}%)`,
                          }))}
                        />
                      </div>
                      <div className="col-12 col-md px-0">
                        <Select
                          key={key('category')}
                          {...getInputProps('category')}
                          label={t('expenses.recurring.edit.controls.category')}
                          required
                          disabled={!expenseCategories?.length || isSubmitting}
                          data={expenseCategories?.map((expenseCategory) => ({
                            value: expenseCategory.uuid,
                            label: expenseCategory.name,
                          }))}
                          renderOption={(item) => {
                            const option = expenseCategories!.find(
                              (expenseCategory) => expenseCategory.uuid === item.option.value
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
                    </div>
                  </div>
                  <Switch
                    name="status"
                    key={key('status')}
                    {...getInputProps('status')}
                    defaultChecked={initialState?.status ?? true}
                    label={t('expenses.recurring.edit.controls.status')}
                    disabled={isSubmitting}
                  />
                  <Textarea
                    key={key('recurrenceRule')}
                    {...getInputProps('recurrenceRule')}
                    label={t('expenses.recurring.edit.controls.recurrenceRule')}
                    disabled={isSubmitting}
                    required
                    maxRows={2}
                  />
                  <RRuleGenerator />
                  <div className="d-flex justify-content-between gap-3 mt-5">
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

