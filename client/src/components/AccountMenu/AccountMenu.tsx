import { Box, Menu, Stack, Text } from '@mantine/core';
import { useMediaQuery } from '@mantine/hooks';
import { IconLanguage, IconLogout, IconUserCircle } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { MOBILE_MEDIA_QUERY } from '../../constants/media-query';
import { SUPPORTED_LANGUAGES } from '../../model/lang';
import type { AppState } from '../../model/state';
import LangMenu from '../LangMenu/LangMenu';
import { useChangeLanguage } from '../LangMenu/useChangeLanguage';
import type { NavigationOption } from '../../model/navigation';
import NavbarLink from '../NavbarLink/NavbarLink';

interface AccountMenuProps {
  options: NavigationOption[];
  activeLink?: string;
  onNavigate: (link: string) => void;
  onLogout: () => void;
}

export default function AccountMenu({ options, activeLink, onNavigate, onLogout }: AccountMenuProps) {
  const { t } = useTranslation();
  const isMobile = useMediaQuery(MOBILE_MEDIA_QUERY);
  const username = useSelector(({ auth }: AppState) => auth.credentials?.username);
  const selectedLanguage = useSelector(({ lang }: AppState) => lang.selectedLanguage);
  const changeLanguage = useChangeLanguage();

  if (isMobile) {
    return (
      <Stack gap={5}>
        <LangMenu />
        {options.map((option) => (
          <NavbarLink
            {...option}
            key={option.link}
            active={option.link === activeLink}
            onClick={() => onNavigate(option.link)}
          />
        ))}
        <NavbarLink color="red" icon={IconLogout} label={t('actions.logout')} onClick={onLogout} />
      </Stack>
    );
  }

  return (
    <Menu withinPortal position="right-end" offset={12}>
      <Menu.Target>
        <NavbarLink
          icon={IconUserCircle}
          label={username ?? t('navigation.account')}
          active={options.some((option) => option.link === activeLink)}
        />
      </Menu.Target>
      <Menu.Dropdown>
        <Menu.Label>{username ?? t('navigation.account')}</Menu.Label>
        {options.map(({ icon: Icon, label, link }) => (
          <Menu.Item
            key={link}
            leftSection={<Icon size={18} stroke={1.5} />}
            color={link === activeLink ? 'green' : undefined}
            onClick={() => onNavigate(link)}
          >
            {label}
          </Menu.Item>
        ))}
        <Menu.Sub position="right-start">
          <Menu.Sub.Target>
            <Menu.Sub.Item leftSection={<IconLanguage size={18} stroke={1.5} />}>{t('language.select')}</Menu.Sub.Item>
          </Menu.Sub.Target>
          <Menu.Sub.Dropdown>
            {SUPPORTED_LANGUAGES.map((option) => (
              <Menu.Item
                key={option.lang_code}
                leftSection={<Text size="lg">{option.flag}</Text>}
                color={option.lang_code === selectedLanguage ? 'green' : undefined}
                onClick={() => changeLanguage(option.lang_code)}
              >
                <Box fw={option.lang_code === selectedLanguage ? 600 : undefined}>{option.lang_name}</Box>
              </Menu.Item>
            ))}
          </Menu.Sub.Dropdown>
        </Menu.Sub>
        <Menu.Divider />
        <Menu.Item color="red" leftSection={<IconLogout size={18} stroke={1.5} />} onClick={onLogout}>
          {t('actions.logout')}
        </Menu.Item>
      </Menu.Dropdown>
    </Menu>
  );
}
