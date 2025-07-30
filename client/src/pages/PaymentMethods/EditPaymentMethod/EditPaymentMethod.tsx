import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router';
import type { PaymentMethod, PaymentMethodDto } from '../../../model/payment-methods';
import { ApiService } from '../../../services/api/api.service';
import { useQuery } from '@tanstack/react-query';
import { useState, useEffect, type FormEvent } from 'react';
import RRuleGenerator from '../../../components/RRuleGenerator/RRuleGenerator';
import { useSnackbar } from 'notistack';
import { parseError } from '../../../utils/error-parser.utils';
import { PAYMENT_METHOD_ICONS } from '../../../constants/icons';
import Layout from '../../../components/Layout/Layout';
import { useForm } from '@mantine/form';
import { Box, Button, ColorInput, LoadingOverlay, Select, Switch, TextInput, Title, Tooltip } from '@mantine/core';
import { IconArrowBack, IconDeviceFloppy, IconRestore, IconTrash } from '@tabler/icons-react';
import MaterialIcon from '../../../components/MaterialIcon/MaterialIcon';

export default function EditPaymentMethod() {
  const { uuid } = useParams<{ uuid: string }>();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const [initialState, setInitialState] = useState<PaymentMethod | null>(null);
  const { onSubmit, key, getInputProps, reset, setInitialValues } = useForm<PaymentMethodDto>({
    mode: 'uncontrolled',
    initialValues: {
      name: initialState?.name ?? '',
      icon: initialState?.icon ?? '',
      iconColor: initialState?.iconColor ?? '#FFFFFF',
      credit: initialState?.credit ?? false,
      creditClosingDateRule: initialState?.creditClosingDateRule ?? '',
      creditDueDateRule: initialState?.creditDueDateRule ?? '',
    },
  });
  const [isCredit, setIsCredit] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { error: paymentMethodError, data: paymentMethodResponse } = useQuery({
    queryKey: ['paymentMethodByUuid', uuid],
    queryFn: () => ApiService.getUserPaymentMethodByUuid(uuid!),
  });

  useEffect(() => {
    if (paymentMethodResponse) {
      setInitialState(paymentMethodResponse);
      setInitialValues({
        name: paymentMethodResponse.name,
        icon: paymentMethodResponse.icon,
        iconColor: paymentMethodResponse.iconColor,
        credit: paymentMethodResponse.credit,
        creditClosingDateRule: paymentMethodResponse.creditClosingDateRule ?? '',
        creditDueDateRule: paymentMethodResponse.creditDueDateRule ?? '',
      });
      reset();
      setIsCredit(paymentMethodResponse.credit);
      setIsLoading(false);
    }
  }, [paymentMethodResponse]);

  useEffect(() => {
    if (paymentMethodError) {
      enqueueSnackbar(t(parseError(paymentMethodError) ?? 'Error'), { variant: 'error' });
      navigate('..');
    }
  }, [paymentMethodError]);

  function handleSubmit(data: PaymentMethodDto) {
    if (!isSubmitting) {
      setIsSubmitting(true);
      ApiService.updatePaymentMethod(uuid!, data)
        .then(() => {
          navigate('/payment-methods');
        })
        .catch((error) => {
          setIsSubmitting(false);
          enqueueSnackbar(t(parseError(error) ?? 'Error'), { variant: 'error' });
        });
    }
  }

  function onFormChange(event: FormEvent<HTMLFormElement>) {
    if ((event.target as any)?.name === 'credit') {
      setIsCredit((event.target as HTMLInputElement).checked);
    }
  }

  function onReturn() {
    navigate('..');
  }

  function onDelete() {
    if (!isSubmitting) {
      setIsSubmitting(true);
      ApiService.deletePaymentMethod(uuid!)
        .then(() => {
          navigate('/payment-methods');
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
                    {t('paymentMethods.edit.title')}
                  </Title>
                </div>
              </div>
            </div>
            <div className="container py-3">
              <div className="row">
                <div className="col">
                  <form
                    className="d-flex flex-column gap-3 my-2"
                    onChange={onFormChange}
                    onSubmit={onSubmit(handleSubmit)}
                  >
                    <TextInput
                      key={key('name')}
                      {...getInputProps('name')}
                      label={t('paymentMethods.edit.controls.name')}
                      required
                      disabled={isSubmitting}
                    />

                    <div className="container px-0">
                      <div className="row mx-0 gap-3">
                        <div className="col-12 col-md px-0">
                          <Select
                            key={key('icon')}
                            {...getInputProps('icon')}
                            label={t('paymentMethods.edit.controls.icon')}
                            required
                            disabled={isSubmitting}
                            data={PAYMENT_METHOD_ICONS.map((icon) => ({ value: icon.icon, label: icon.label }))}
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
                            label={t('paymentMethods.edit.controls.iconColor')}
                            required
                            disabled={isSubmitting}
                          />
                        </div>
                      </div>
                    </div>
                    <Switch
                      name="credit"
                      key={key('credit')}
                      {...getInputProps('credit')}
                      defaultChecked={initialState?.credit ?? false}
                      label={t('paymentMethods.edit.controls.credit')}
                      disabled={isSubmitting}
                    />
                    {isCredit && (
                      <>
                        <TextInput
                          key={key('creditClosingDateRule')}
                          {...getInputProps('creditClosingDateRule')}
                          label={t('paymentMethods.edit.controls.creditClosingDateRule')}
                          disabled={!isCredit || isSubmitting}
                          required={isCredit}
                        />
                        <TextInput
                          key={key('creditDueDateRule')}
                          {...getInputProps('creditDueDateRule')}
                          label={t('paymentMethods.edit.controls.creditDueDateRule')}
                          disabled={!isCredit || isSubmitting}
                          required={isCredit}
                        />
                        <RRuleGenerator />
                      </>
                    )}
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

