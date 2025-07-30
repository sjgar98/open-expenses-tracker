import { useSnackbar } from 'notistack';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router';
import type { Currency, CurrencyDto } from '../../../model/currencies';
import { useEffect, useState } from 'react';
import { ApiService } from '../../../services/api/api.service';
import { useQuery } from '@tanstack/react-query';
import { parseError } from '../../../utils/error-parser.utils';
import Layout from '../../../components/Layout/Layout';
import { useForm } from '@mantine/form';
import { Box, Button, LoadingOverlay, Switch, TextInput, Title, Tooltip } from '@mantine/core';
import { IconArrowBack, IconDeviceFloppy, IconRestore, IconTrash } from '@tabler/icons-react';

export default function EditCurrency() {
  const { id } = useParams<{ id: string }>();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const [initialState, setInitialState] = useState<Currency | null>(null);
  const { onSubmit, key, getInputProps, reset, setInitialValues } = useForm<CurrencyDto>({
    mode: 'uncontrolled',
    initialValues: {
      name: initialState?.name ?? '',
      code: initialState?.code ?? '',
      visible: initialState?.visible ?? true,
    },
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { error: currencyError, data: currencyResponse } = useQuery({
    queryKey: ['currencyById', id],
    queryFn: () => ApiService.getCurrencyById(id!),
  });

  useEffect(() => {
    if (currencyResponse) {
      setInitialState(currencyResponse);
      setInitialValues({
        name: currencyResponse.name,
        code: currencyResponse.code,
        visible: currencyResponse.visible,
      });
      reset();
      setIsLoading(false);
    }
  }, [currencyResponse]);

  useEffect(() => {
    if (currencyError) {
      enqueueSnackbar(t(parseError(currencyError) ?? 'Error'), { variant: 'error' });
    }
  }, [currencyError]);

  function handleSubmit(data: CurrencyDto) {
    if (!isSubmitting) {
      setIsSubmitting(true);
      ApiService.updateCurrency(Number(id!), data)
        .then(() => {
          navigate('/currencies');
        })
        .catch((error) => {
          setIsSubmitting(false);
          enqueueSnackbar(t(parseError(error) ?? 'Error'), { variant: 'error' });
        });
    }
  }

  function onReturn() {
    navigate('/currencies');
  }

  function onDelete() {
    if (!isSubmitting) {
      setIsSubmitting(true);
      ApiService.deleteCurrency(Number(id!))
        .then(() => {
          navigate('/currencies');
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
                    {t('currencies.edit.title')}
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
                      label={t('currencies.edit.controls.name')}
                      required
                      disabled={isSubmitting}
                    />
                    <TextInput
                      key={key('code')}
                      {...getInputProps('code')}
                      label={t('currencies.edit.controls.code')}
                      required
                      disabled={isSubmitting}
                    />
                    <Switch
                      key={key('visible')}
                      {...getInputProps('visible')}
                      defaultChecked={initialState?.visible}
                      label={t('currencies.edit.controls.visible')}
                      disabled={isSubmitting}
                    />
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

