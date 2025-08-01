import { useTranslation } from 'react-i18next';
import { type PaymentMethodDto } from '../../../model/payment-methods';
import RRuleGenerator from '../../../components/RRuleGenerator/RRuleGenerator';
import { useNavigate } from 'react-router';
import { useState, type FormEvent } from 'react';
import { ApiService } from '../../../services/api/api.service';
import { useSnackbar } from 'notistack';
import { parseError } from '../../../utils/error-parser.utils';
import { PAYMENT_METHOD_ICONS } from '../../../constants/icons';
import Layout from '../../../components/Layout/Layout';
import { Box, Button, ColorInput, Select, Switch, Textarea, TextInput, Title } from '@mantine/core';
import { IconArrowBack, IconDeviceFloppy, IconRestore } from '@tabler/icons-react';
import MaterialIcon from '../../../components/MaterialIcon/MaterialIcon';
import { useForm } from '@mantine/form';
import { useQuery } from '@tanstack/react-query';

export default function NewPaymentMethod() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const { onSubmit, key, getInputProps, reset } = useForm<PaymentMethodDto>({
    mode: 'uncontrolled',
    initialValues: {
      name: '',
      icon: '',
      iconColor: '#FFFFFF',
      account: '',
      credit: false,
      creditClosingDateRule: '',
      creditDueDateRule: '',
    },
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCredit, setIsCredit] = useState(false);
  const { data: accounts } = useQuery({ queryKey: ['accounts'], queryFn: () => ApiService.getAccounts() });

  function handleSubmit(data: PaymentMethodDto) {
    if (!isSubmitting) {
      setIsSubmitting(true);
      ApiService.saveNewPaymentMethod(data)
        .then(() => {
          navigate('..');
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

  return (
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
              {t('paymentMethods.new.title')}
            </Title>
          </div>
        </div>
      </div>
      <div className="container py-3">
        <div className="row">
          <div className="col">
            <form className="d-flex flex-column gap-3 my-2" onChange={onFormChange} onSubmit={onSubmit(handleSubmit)}>
              <TextInput
                key={key('name')}
                {...getInputProps('name')}
                label={t('paymentMethods.new.controls.name')}
                required
                disabled={isSubmitting}
              />
              <div className="container px-0">
                <div className="row mx-0 gap-3">
                  <div className="col-12 col-md px-0">
                    <Select
                      key={key('icon')}
                      {...getInputProps('icon')}
                      label={t('paymentMethods.new.controls.icon')}
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
                      label={t('paymentMethods.new.controls.iconColor')}
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
              <Switch
                name="credit"
                key={key('credit')}
                {...getInputProps('credit')}
                defaultChecked={false}
                label={t('paymentMethods.new.controls.credit')}
                disabled={isSubmitting}
              />
              {isCredit && (
                <>
                  <Textarea
                    key={key('creditClosingDateRule')}
                    {...getInputProps('creditClosingDateRule')}
                    label={t('paymentMethods.new.controls.creditClosingDateRule')}
                    disabled={!isCredit || isSubmitting}
                    required={isCredit}
                    maxRows={2}
                  />
                  <Textarea
                    key={key('creditDueDateRule')}
                    {...getInputProps('creditDueDateRule')}
                    label={t('paymentMethods.new.controls.creditDueDateRule')}
                    disabled={!isCredit || isSubmitting}
                    required={isCredit}
                    maxRows={2}
                  />
                  <RRuleGenerator />
                </>
              )}
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
    </Layout>
  );
}

