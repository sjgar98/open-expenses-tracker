import { Group, Text } from '@mantine/core';
import { IconCloudOff } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import { useConnectivity } from '../../utils/use-online.hook';

export default function OfflineBanner() {
  const { t } = useTranslation();
  const connectivity = useConnectivity();
  if (connectivity === 'online') return null;
  return (
    <Group
      role="status"
      gap={8}
      justify="center"
      wrap="nowrap"
      px="md"
      py={6}
      bg="yellow.3"
      c="dark.8"
      style={{ flexShrink: 0 }}
    >
      <IconCloudOff size={18} style={{ flexShrink: 0 }} />
      <Text size="sm">{t(connectivity === 'offline' ? 'offline.banner' : 'offline.serverUnreachable')}</Text>
    </Group>
  );
}
