import { Group, Loader, Text, UnstyledButton } from '@mantine/core';
import { IconCloudOff } from '@tabler/icons-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { recheckConnectivity } from '../../services/connectivity/connectivity.service';
import { useConnectivity } from '../../utils/use-online.hook';

export default function OfflineBanner() {
  const { t } = useTranslation();
  const connectivity = useConnectivity();
  const [checking, setChecking] = useState(false);
  if (connectivity === 'online') return null;

  const recheck = () => {
    if (checking) return;
    setChecking(true);
    recheckConnectivity().finally(() => setChecking(false));
  };

  return (
    <UnstyledButton onClick={recheck} aria-busy={checking} bg="yellow.3" c="dark.8" style={{ flexShrink: 0 }}>
      <Group role="status" gap={8} justify="center" wrap="nowrap" px="md" py={6}>
        {checking ? (
          <Loader size="xs" color="dark.8" style={{ flexShrink: 0 }} />
        ) : (
          <IconCloudOff size={18} style={{ flexShrink: 0 }} />
        )}
        <Text size="sm">{t(connectivity === 'offline' ? 'offline.banner' : 'offline.serverUnreachable')}</Text>
      </Group>
    </UnstyledButton>
  );
}
