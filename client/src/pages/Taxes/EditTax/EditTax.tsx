import { useForm } from '@mantine/form';
import { useSnackbar } from 'notistack';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router';
import type { TaxDto } from '../../../model/taxes';
import { ApiService } from '../../../services/api/api.service';
import { useQuery } from '@tanstack/react-query';
import { parseError } from '../../../utils/error-parser.utils';
import Layout from '../../../components/Layout/Layout';
import { Box, Button, LoadingOverlay, NumberInput, TextInput, Title, Tooltip } from '@mantine/core';
import { IconArrowBack, IconDeviceFloppy, IconRestore, IconTrash } from '@tabler/icons-react';

export default function EditTax() {
  const { uuid } = useParams();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const [initialState, setInitialState] = useState<TaxDto | null>(null);
  const { onSubmit, key, getInputProps, reset, setInitialValues } = useForm<TaxDto>({
    mode: 'uncontrolled',
    initialValues: {
      name: initialState?.name ?? '',
      rate: initialState?.rate ?? 0,
    },
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { error: taxError, data: taxResponse } = useQuery({
    queryKey: ['tax', uuid],
    queryFn: () => ApiService.getUserTaxByUuid(uuid!),
  });

  useEffect(() => {
    if (taxResponse) {
      setInitialState(taxResponse);
      setInitialValues(taxResponse);
      reset();
      setIsLoading(false);
    }
    setIsLoading(false);
  }, [taxResponse]);

  useEffect(() => {
    if (taxError) {
      enqueueSnackbar(t(parseError(taxError) ?? 'Error'), { variant: 'error' });
      navigate('..');
    }
  }, [taxError]);

  function handleSubmit(data: TaxDto) {
    if (!isSubmitting) {
      setIsSubmitting(true);
      ApiService.updateUserTax(uuid!, data)
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
      ApiService.deleteUserTax(uuid!)
        .then(() => {
          navigate('..');
        })
        .catch((error) => {
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
                    {t('taxes.edit.title')}
                  </Title>
                </div>
              </div>
            </div>
            <div className="container py-3">
              <div className="row">
                <div className="col">
                  <form className="d-flex flex-column gap-3 my-3" onSubmit={onSubmit(handleSubmit)}>
                    <TextInput
                      key={key('name')}
                      {...getInputProps('name')}
                      label={t('taxes.edit.controls.name')}
                      required
                      disabled={isSubmitting}
                    />
                    <NumberInput
                      key={key('rate')}
                      {...getInputProps('rate')}
                      min={0.01}
                      max={100}
                      decimalScale={2}
                      valueIsNumericString
                      label={t('taxes.edit.controls.rate')}
                      allowNegative={false}
                      suffix=" %"
                      hideControls
                      required
                      disabled={isSubmitting}
                    />
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
          </>
        )}
      </Layout>
      <LoadingOverlay visible={isLoading} zIndex={1000} loaderProps={{ size: 100, color: 'green' }} />
    </>
  );
}

