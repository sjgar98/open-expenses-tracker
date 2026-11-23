import { Stack, Text, Title } from '@mantine/core';
import { IconCloudOff } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';

interface OfflineUnavailableProps {
  compact?: boolean;
}

export default function OfflineUnavailable({ compact }: OfflineUnavailableProps) {
  const { t } = useTranslation();
  return (
    <Stack
      align="center"
      justify="center"
      gap={compact ? 4 : 8}
      h={compact ? undefined : '100%'}
      flex={compact ? 1 : undefined}
      p="md"
      ta="center"
      c="dimmed"
    >
      <IconCloudOff size={compact ? 32 : 64} stroke={1.5} />
      <Title order={compact ? 6 : 4}>{t('offline.unavailableTitle')}</Title>
      <Text size={compact ? 'xs' : 'sm'}>{t('offline.unavailableText')}</Text>
    </Stack>
  );
}
