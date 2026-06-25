import { useSnackbar } from 'notistack';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router';
import { useForm } from '@mantine/form';
import { ApiService } from '../../../services/api/api.service';
import { useQuery } from '@tanstack/react-query';
import { parseError } from '../../../utils/error-parser.utils';
import Layout from '../../../components/Layout/Layout';
import { Box, Button, ColorInput, LoadingOverlay, NumberInput, Select, TextInput, Title, Tooltip } from '@mantine/core';
import { IconArrowBack, IconDeviceFloppy, IconRestore, IconTrash } from '@tabler/icons-react';
import { EXPENSE_CATEGORY_ICONS } from '../../../constants/icons';
import MaterialIcon from '../../../components/MaterialIcon/MaterialIcon';
import type { SavingsBucket, SavingsBucketDto, SavingsBucketForm } from '../../../model/savings-buckets';
import { DateTime } from 'luxon';
import { DatePickerInput } from '@mantine/dates';

export default function EditSavingsBucket() {
  const { uuid } = useParams<{ uuid: string }>();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const [initialState, setInitialState] = useState<SavingsBucket | null>(null);
  const { onSubmit, key, getInputProps, reset, setInitialValues } = useForm<SavingsBucketForm>({
    mode: 'uncontrolled',
    initialValues: {
      name: initialState?.name ?? '',
      icon: initialState?.icon ?? '',
      iconColor: initialState?.iconColor ?? '#FFFFFF',
      currency: initialState?.currency?.code ?? '',
      targetAmount: initialState?.targetAmount ? String(initialState.targetAmount) : '',
      deadline: initialState?.deadline ? DateTime.fromISO(initialState.deadline).toFormat('yyyy-MM-dd') : '',
    },
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { data: currencies } = useQuery({ queryKey: ['currencies'], queryFn: () => ApiService.getCurrencies() });
  const { error: bucketError, data: bucketResponse } = useQuery({
    queryKey: ['savingsBucketByUuid', uuid],
    queryFn: () => ApiService.getSavingsBucketByUuid(uuid!),
  });

  useEffect(() => {
    if (bucketResponse) {
      setInitialState(bucketResponse);
      setInitialValues({
        name: bucketResponse.name,
        icon: bucketResponse.icon,
        iconColor: bucketResponse.iconColor,
        currency: bucketResponse.currency.code,
        targetAmount: bucketResponse.targetAmount ? String(bucketResponse.targetAmount) : '',
        deadline: bucketResponse.deadline ? DateTime.fromISO(bucketResponse.deadline).toFormat('yyyy-MM-dd') : null,
      });
      reset();
      setIsLoading(false);
    }
  }, [bucketResponse]);

  useEffect(() => {
    if (bucketError) {
      enqueueSnackbar(t(parseError(bucketError) ?? 'Error'), { variant: 'error' });
      navigate('..');
    }
  }, [bucketError]);

  function handleSubmit(data: SavingsBucketForm) {
    if (!isSubmitting) {
      const savingsBucketDto: SavingsBucketDto = {
        name: data.name,
        icon: data.icon,
        iconColor: data.iconColor,
        currency: currencies?.find((c) => c.code === data.currency)?.id ?? 0,
        targetAmount: data.targetAmount ? parseFloat(data.targetAmount) : null,
        deadline: data.deadline ? DateTime.fromFormat(data.deadline, 'yyyy-MM-dd').toISO() : null,
      };
      setIsSubmitting(true);
      ApiService.updateSavingsBucket(uuid!, savingsBucketDto)
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
      ApiService.deleteSavingsBucket(uuid!)
        .then(() => {
          navigate('..');
        })
        .catch((error) => {
          setIsSubmitting(false);
          enqueueSnackbar(t(parseError(error) ?? 'Error'), { variant: 'error' });
        });
    }
  }

  function onRestore() {
    if (!isSubmitting) {
      setIsSubmitting(true);
      ApiService.restoreSavingsBucket(uuid!)
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
                    {t('savingsBuckets.edit.title')}
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
                      label={t('savingsBuckets.edit.controls.name')}
                      required
                      disabled={isSubmitting}
                    />
                    <div className="container px-0">
                      <div className="row mx-0 gap-3">
                        <div className="col-12 col-md px-0">
                          <Select
                            key={key('icon')}
                            {...getInputProps('icon')}
                            label={t('savingsBuckets.edit.controls.icon')}
                            required
                            data={EXPENSE_CATEGORY_ICONS.map((icon) => ({ value: icon.icon, label: icon.label }))}
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
                            label={t('savingsBuckets.edit.controls.iconColor')}
                            required
                            disabled={isSubmitting}
                          />
                        </div>
                      </div>
                    </div>
                    <div className="container px-0">
                      <div className="row mx-0 gap-3">
                        <div className="col-12 col-md-4 px-0">
                          <Select
                            key={key('currency')}
                            {...getInputProps('currency')}
                            label={t('savingsBuckets.edit.controls.currency')}
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
                            key={key('targetAmount')}
                            {...getInputProps('targetAmount')}
                            thousandSeparator
                            decimalScale={2}
                            valueIsNumericString
                            label={t('savingsBuckets.edit.controls.targetAmount')}
                            allowNegative={false}
                            hideControls
                            disabled={isSubmitting}
                          />
                        </div>
                        <div className="col-12 col-md px-0">
                          <DatePickerInput
                            key={key('deadline')}
                            {...getInputProps('deadline')}
                            label={t('savingsBuckets.edit.controls.deadline')}
                            disabled={isSubmitting}
                            valueFormat="DD/MM/YYYY"
                          />
                        </div>
                      </div>
                    </div>
                    <div className="d-flex justify-content-between gap-3 mt-5">
                      <div className="d-flex gap-3">
                        {bucketResponse?.isDeleted ? (
                          <Button
                            variant="subtle"
                            color="yellow"
                            className="px-2"
                            onClick={onRestore}
                            disabled={isSubmitting}
                          >
                            <Tooltip label={t('actions.restore')} withArrow>
                              <Box className="d-flex align-items-center gap-2">
                                <IconRestore />
                              </Box>
                            </Tooltip>
                          </Button>
                        ) : (
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
                        )}
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
          </>
        )}
      </Layout>
      <LoadingOverlay visible={isLoading} zIndex={1000} loaderProps={{ size: 100, color: 'green' }} />
    </>
  );
}

