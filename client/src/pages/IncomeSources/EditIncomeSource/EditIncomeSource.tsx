import { useNavigate, useParams } from 'react-router';
import { ApiService } from '../../../services/api/api.service';
import { useTranslation } from 'react-i18next';
import { useSnackbar } from 'notistack';
import { useEffect, useState } from 'react';
import type { IncomeSource, IncomeSourceDto } from '../../../model/income-source';
import { useForm } from '@mantine/form';
import { useQuery } from '@tanstack/react-query';
import { parseError } from '../../../utils/error-parser.utils';
import Layout from '../../../components/Layout/Layout';
import { Box, Button, ColorInput, LoadingOverlay, TextInput, Title, Tooltip } from '@mantine/core';
import { IconArrowBack, IconDeviceFloppy, IconRestore, IconTrash } from '@tabler/icons-react';

export default function EditIncomeSource() {
  const { uuid } = useParams<{ uuid: string }>();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const [initialState, setInitialState] = useState<IncomeSource | null>(null);
  const { onSubmit, key, getInputProps, reset, setInitialValues } = useForm<IncomeSourceDto>({
    mode: 'uncontrolled',
    initialValues: {
      name: initialState?.name ?? '',
      color: initialState?.color ?? '#FFFFFF',
    },
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { error: sourceError, data: sourceResponse } = useQuery({
    queryKey: ['incomeSourceByUuid', uuid],
    queryFn: () => ApiService.getIncomeSourceByUuid(uuid!),
  });

  useEffect(() => {
    if (sourceResponse) {
      setInitialState(sourceResponse);
      setInitialValues({
        name: sourceResponse.name,
        color: sourceResponse.color,
      });
      reset();
      setIsLoading(false);
    }
  }, [sourceResponse]);

  useEffect(() => {
    if (sourceError) {
      enqueueSnackbar(t(parseError(sourceError) ?? 'Error'), { variant: 'error' });
      navigate('..');
    }
  }, [sourceError]);

  function handleSubmit(form: IncomeSourceDto) {
    if (!isSubmitting) {
      const data: IncomeSourceDto = {
        name: form.name,
        color: form.color,
      };
      setIsSubmitting(true);
      ApiService.updateIncomeSource(uuid!, data)
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
      ApiService.deleteIncomeSource(uuid!)
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
                    {t('incomeSources.edit.title')}
                  </Title>
                </div>
              </div>
            </div>
            <div className="container py-3">
              <div className="row">
                <div className="col">
                  <form className="d-flex flex-column gap-3 my-2" onSubmit={onSubmit(handleSubmit)}>
                    <div className="container px-0">
                      <div className="row mx-0 gap-3">
                        <div className="col-12 col-md px-0">
                          <TextInput
                            key={key('name')}
                            {...getInputProps('name')}
                            label={t('incomeSources.edit.controls.name')}
                            required
                            disabled={isSubmitting}
                          />
                        </div>
                        <div className="col-12 col-md px-0">
                          <ColorInput
                            key={key('color')}
                            {...getInputProps('color')}
                            label={t('incomeSources.edit.controls.color')}
                            required
                            disabled={isSubmitting}
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
          </>
        )}
      </Layout>
      <LoadingOverlay visible={isLoading} zIndex={1000} loaderProps={{ size: 100, color: 'green' }} />
    </>
  );
}

