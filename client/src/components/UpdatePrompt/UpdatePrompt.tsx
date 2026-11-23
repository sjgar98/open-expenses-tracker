import { useEffect } from 'react';
import { Button } from '@mantine/core';
import { useSnackbar } from 'notistack';
import { useTranslation } from 'react-i18next';
import { useRegisterSW } from 'virtual:pwa-register/react';

export default function UpdatePrompt() {
  const { t } = useTranslation();
  const { enqueueSnackbar } = useSnackbar();
  const {
    needRefresh: [needRefresh],
    updateServiceWorker,
  } = useRegisterSW();

  useEffect(() => {
    if (!needRefresh) return;
    enqueueSnackbar(t('pwa.updateAvailable'), {
      variant: 'info',
      persist: true,
      preventDuplicate: true,
      action: () => (
        <Button size="xs" variant="white" onClick={() => updateServiceWorker(true)}>
          {t('actions.reload')}
        </Button>
      ),
    });
  }, [needRefresh, enqueueSnackbar, t, updateServiceWorker]);

  return null;
}
