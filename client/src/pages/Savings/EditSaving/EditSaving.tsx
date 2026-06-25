import { useSnackbar } from 'notistack';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router';
import type { Saving, SavingDto, SavingForm } from '../../../model/savings';
import { useForm } from '@mantine/form';
import { DateTime } from 'luxon';
import { useQuery } from '@tanstack/react-query';
import { ApiService } from '../../../services/api/api.service';
import { parseError } from '../../../utils/error-parser.utils';
import { Box, Button, LoadingOverlay, NumberInput, Select, TextInput, Title, Tooltip } from '@mantine/core';
import { IconArrowBack, IconDeviceFloppy, IconRestore, IconTrash } from '@tabler/icons-react';
import MaterialIcon from '../../../components/MaterialIcon/MaterialIcon';
import { DatePickerInput } from '@mantine/dates';
import Layout from '../../../components/Layout/Layout';

export default function EditSaving() {
  const { uuid } = useParams<{ uuid: string }>();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const [initialState, setInitialState] = useState<Saving | null>(null);
  const { onSubmit, key, getInputProps, reset, setInitialValues } = useForm<SavingForm>({
    mode: 'uncontrolled',
    initialValues: {
      description: initialState?.description ?? '',
      amount: initialState?.amount ? String(initialState.amount) : '0',
      currency: initialState?.currency.code ?? '',
      bucket: initialState?.bucket.uuid ?? '',
      date: initialState?.date
        ? DateTime.fromISO(initialState.date).toFormat('yyyy-MM-dd')
        : DateTime.now().toFormat('yyyy-MM-dd'),
    },
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { data: currencies } = useQuery({ queryKey: ['currencies'], queryFn: () => ApiService.getCurrencies() });
  const { data: savingsBuckets } = useQuery({
    queryKey: ['savingsBuckets'],
    queryFn: () => ApiService.getSavingsBuckets(),
  });

  const { error: savingError, data: savingResponse } = useQuery({
    queryKey: ['saving', uuid],
    queryFn: () => ApiService.getUserSavingByUuid(uuid!),
  });

  useEffect(() => {
    if (savingResponse) {
      setInitialState(savingResponse);
      setInitialValues({
        description: savingResponse.description,
        amount: String(savingResponse.amount),
        currency: savingResponse.currency.code,
        bucket: savingResponse.bucket.uuid,
        date: DateTime.fromISO(savingResponse.date).toFormat('yyyy-MM-dd'),
      });
      reset();
      setIsLoading(false);
    }
  }, [savingResponse]);

  useEffect(() => {
    if (savingError) {
      enqueueSnackbar(t(parseError(savingError) ?? 'Error'), { variant: 'error' });
      navigate('..');
    }
  }, [savingError]);

  function handleSubmit(data: SavingForm) {
    if (!isSubmitting) {
      const savingDto: SavingDto = {
        description: data.description,
        amount: parseFloat(data.amount),
        currency: currencies?.find((c) => c.code === data.currency)?.id ?? 0,
        bucket: data.bucket,
        date: DateTime.fromFormat(data.date, 'yyyy-MM-dd').toISO()!,
      };
      setIsSubmitting(true);
      ApiService.updateUserSaving(uuid!, savingDto)
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
      ApiService.deleteUserSaving(uuid!)
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
      <Layout>
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
                    {t('savings.edit.title')}
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
                      label={t('savings.edit.controls.description')}
                      required
                      disabled={isSubmitting}
                    />
                    <div className="container px-0">
                      <div className="row mx-0 gap-3">
                        <div className="col-12 col-md-4 px-0">
                          <Select
                            key={key('currency')}
                            {...getInputProps('currency')}
                            label={t('savings.edit.controls.currency')}
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
                            label={t('savings.edit.controls.amount')}
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
                            key={key('bucket')}
                            {...getInputProps('bucket')}
                            label={t('savings.edit.controls.bucket')}
                            required
                            disabled={!savingsBuckets?.length || isSubmitting}
                            data={savingsBuckets?.map((bucket) => ({
                              value: bucket.uuid,
                              label: bucket.name,
                            }))}
                            renderOption={(item) => {
                              const option = savingsBuckets!.find((bucket) => bucket.uuid === item.option.value)!;
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
                          <DatePickerInput
                            key={key('date')}
                            {...getInputProps('date')}
                            label={t('savings.edit.controls.date')}
                            required
                            disabled={isSubmitting}
                            valueFormat="DD/MM/YYYY"
                          />
                        </div>
                      </div>
                    </div>
                    <div className="d-flex justify-content-between gap-3 mt-5">
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
      </Layout>
      <LoadingOverlay visible={isLoading} zIndex={1000} loaderProps={{ size: 100, color: 'green' }} />
    </>
  );
}

