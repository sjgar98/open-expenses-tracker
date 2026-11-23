import { Box, Button, Menu, Tooltip, useMantineColorScheme } from '@mantine/core';
import { useMediaQuery } from '@mantine/hooks';
import { useTranslation } from 'react-i18next';
import { MOBILE_MEDIA_QUERY } from '../../constants/media-query';
import { COLOR_SCHEME_OPTIONS } from './colorSchemeOptions';

export default function ColorSchemeMenu() {
  const { t } = useTranslation();
  const { colorScheme, setColorScheme } = useMantineColorScheme();
  const isMobile = useMediaQuery(MOBILE_MEDIA_QUERY);
  const current = COLOR_SCHEME_OPTIONS.find((option) => option.value === colorScheme) ?? COLOR_SCHEME_OPTIONS[0];
  const CurrentIcon = current.icon;

  return (
    <Menu withinPortal position={isMobile ? 'bottom-start' : 'right-end'}>
      <Menu.Target>
        <Tooltip label={t('colorScheme.title')} position="right" transitionProps={{ duration: 0 }} withArrow>
          <Button
            variant="default"
            style={{ height: 'max-content' }}
            classNames={
              isMobile
                ? { root: 'w-100 py-2', inner: 'justify-content-start' }
                : { root: 'w-100 py-2 px-0', inner: 'justify-content-center' }
            }
          >
            <Box className="d-flex gap-2 align-items-center">
              <CurrentIcon size={20} stroke={1.5} />
              {isMobile && <span>{t(current.labelKey)}</span>}
            </Box>
          </Button>
        </Tooltip>
      </Menu.Target>
      <Menu.Dropdown>
        <Menu.Label>{t('colorScheme.title')}</Menu.Label>
        {COLOR_SCHEME_OPTIONS.map(({ value, icon: Icon, labelKey }) => (
          <Menu.Item
            key={value}
            leftSection={<Icon size={18} stroke={1.5} />}
            color={value === colorScheme ? 'green' : undefined}
            onClick={() => setColorScheme(value)}
          >
            <Box fw={value === colorScheme ? 600 : undefined}>{t(labelKey)}</Box>
          </Menu.Item>
        ))}
      </Menu.Dropdown>
    </Menu>
  );
}
