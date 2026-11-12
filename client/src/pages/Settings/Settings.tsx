import { useSnackbar } from 'notistack';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import Layout from '../../components/Layout/Layout';
import { Box, Button, LoadingOverlay, Select, Switch, Title, Tooltip } from '@mantine/core';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { ApiService } from '../../services/api/api.service';
import { type UserSettings, type UserSettingsDto } from '../../model/user-settings';
import { useForm } from '@mantine/form';
import { parseError } from '../../utils/error-parser.utils';
import { IconDeviceFloppy, IconRefresh } from '@tabler/icons-react';

export default function Settings() {
  const { t } = useTranslation();
  const { enqueueSnackbar } = useSnackbar();
  const queryClient = useQueryClient();
  const [initialState, setInitialState] = useState<UserSettings | null>(null);
  const { onSubmit, key, getInputProps, reset, setInitialValues } = useForm<UserSettingsDto>({
    mode: 'uncontrolled',
    initialValues: {
      displayCurrency: initialState?.displayCurrency ?? 'USD',
      showDeletedOptions: initialState?.showDeletedOptions ?? false,
    },
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const { data: currencies } = useQuery({ queryKey: ['currencies'], queryFn: () => ApiService.getCurrencies() });

  const { error: userSettingsError, data: userSettingsResponse } = useQuery({
    queryKey: ['userSettings'],
    queryFn: () => ApiService.getUserSettings(),
  });

  useEffect(() => {
    if (userSettingsResponse) {
      setInitialState(userSettingsResponse);
      setInitialValues(userSettingsResponse);
      reset();
      setIsLoading(false);
    }
  }, [userSettingsResponse]);

  useEffect(() => {
    if (userSettingsError) {
      enqueueSnackbar(t(parseError(userSettingsError) ?? 'Error'), { variant: 'error' });
    }
  }, [userSettingsError]);

  function handleSubmit(values: UserSettingsDto) {
    if (!isSubmitting) {
      setIsSubmitting(true);
      ApiService.updateUserSettings(values)
        .then((response) => {
          setInitialState(response);
          setInitialValues(response);
        })
        .catch((error) => {
          enqueueSnackbar(t(parseError(error) ?? 'Error'), { variant: 'error' });
        })
        .finally(() => {
          setIsSubmitting(false);
        });
    }
  }

  function handleSyncScheduledEvents() {
    if (!isSyncing) {
      setIsSyncing(true);
      ApiService.syncScheduledEvents()
        .then((result) => {
          enqueueSnackbar(
            t('settings.messages.synced')
              .replace('#EXPENSES#', String(result.expenses))
              .replace('#INCOMES#', String(result.incomes)),
            { variant: 'success' }
          );
          queryClient.invalidateQueries();
        })
        .catch((error) => {
          enqueueSnackbar(t(parseError(error) ?? 'Error'), { variant: 'error' });
        })
        .finally(() => {
          setIsSyncing(false);
        });
    }
  }

  return (
    <>
      {!isLoading && (
        <Layout>
          <div className="container flex-grow-1 align-content-center">
            <div className="row justify-content-center mb-3">
              <div className="col-12 col-md-6">
                <Title order={1} style={{ textAlign: 'center' }}>
                  {t('settings.title')}
                </Title>
              </div>
            </div>
            <div className="row">
              <div className="col">
                <form className="d-flex flex-column gap-3 my-2" onSubmit={onSubmit(handleSubmit)}>
                  <div className="container-fluid">
                    <div className="row align-items-center mb-3">
                      <div className="col col-md-4">
                        <Select
                          searchable
                          key={key('displayCurrency')}
                          {...getInputProps('displayCurrency')}
                          label={t('settings.controls.displayCurrency')}
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
                    </div>
                    <div className="row align-items-center">
                      <div className="col col-md-4">
                        <Switch
                          color="red"
                          key={key('showDeletedOptions')}
                          {...getInputProps('showDeletedOptions')}
                          defaultChecked={userSettingsResponse?.showDeletedOptions ?? false}
                          label={t('settings.controls.showDeletedOptions')}
                          disabled={isSubmitting}
                        />
                      </div>
                    </div>
                  </div>
                  <div className="d-flex justify-content-end gap-3 mt-5">
                    <div className="d-flex gap-3">
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
            <div className="row mt-5">
              <div className="col">
                <Title order={3} className="mb-3">
                  {t('settings.userActions.title')}
                </Title>
                <Tooltip label={t('settings.userActions.syncScheduledEvents')}>
                  <Button variant="outline" color="blue" onClick={handleSyncScheduledEvents} loading={isSyncing}>
                    <Box className="d-flex align-items-center gap-2">
                      <IconRefresh />
                      <span>{t('actions.sync')}</span>
                    </Box>
                  </Button>
                </Tooltip>
              </div>
            </div>
          </div>
        </Layout>
      )}
      <LoadingOverlay visible={isLoading} zIndex={1000} loaderProps={{ size: 100, color: 'green' }} />
    </>
  );
}

