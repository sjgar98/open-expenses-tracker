import { useLocation, useNavigate } from 'react-router';
import { useSelector } from 'react-redux';
import type { AppState } from '../../model/state';
import { IconLogout, type Icon, type IconProps } from '@tabler/icons-react';
import { Box, Button, Center, Divider, Stack, Tooltip, type DefaultMantineColor } from '@mantine/core';
import { useEffect, useState, type ForwardRefExoticComponent, type RefAttributes } from 'react';
import type { NavigationOption, NavigationSection } from '../Navigation/Navigation';
import { useMediaQuery } from '@mantine/hooks';
import { useTranslation } from 'react-i18next';
import LangMenu from '../LangMenu/LangMenu';
import { MOBILE_MEDIA_QUERY } from '../../constants/media-query';
import AppLogo from '../AppLogo/AppLogo';

interface NavbarLinkProps {
  icon: ForwardRefExoticComponent<IconProps & RefAttributes<Icon>>;
  label: string;
  active?: boolean;
  color?: DefaultMantineColor;
  onClick?: () => void;
}

function NavbarLink({ icon: Icon, label, onClick, active, color }: NavbarLinkProps) {
  const isMobile = useMediaQuery(MOBILE_MEDIA_QUERY);
  return (
    <Tooltip label={label} position="right" transitionProps={{ duration: 0 }} withArrow>
      <Button
        variant={active ? 'filled' : 'subtle'}
        color={color ?? 'green'}
        onClick={onClick}
        style={{ height: 'max-content' }}
        classNames={
          isMobile
            ? {
                root: 'py-3',
                inner: 'justify-content-start',
              }
            : {
                root: 'py-3 px-0',
                inner: 'justify-content-center',
              }
        }
      >
        <Box className="d-flex gap-2 align-items-center">
          <Icon size={20} stroke={1.5} />
          {isMobile && <span>{label}</span>}
        </Box>
      </Button>
    </Tooltip>
  );
}

interface NavBarProps {
  navigationSections: NavigationSection[];
  onLogout: () => void;
}

export default function NavBar({ navigationSections, onLogout }: NavBarProps) {
  const { t } = useTranslation();
  const location = useLocation();
  const [active, setActive] = useState<NavigationOption | undefined>(
    navigationSections
      .flatMap((section) => section.options)
      .find((navigationOption) => navigationOption.link === location.pathname.split('/')[1])
  );
  const credentials = useSelector(({ auth }: AppState) => auth.credentials);
  const navigate = useNavigate();
  const isMobile = useMediaQuery(MOBILE_MEDIA_QUERY);

  useEffect(() => {
    const activeOption = navigationSections
      .flatMap((section) => section.options)
      .find((navigationOption) => navigationOption.link === location.pathname.split('/')[1]);
    setActive(activeOption);
    if (activeOption) {
      document.title = activeOption.label;
    }
  }, [location]);

  return (
    <nav
      className="h-100 p-2 d-flex flex-column"
      style={{ width: isMobile ? '100%' : 80, backgroundColor: !isMobile ? 'black' : undefined }}
    >
      {!isMobile && (
        <Center className="mt-3 mb-4">
          <AppLogo />
        </Center>
      )}
      <Center className="mb-3">
        <LangMenu />
      </Center>
      <Box className="flex-grow-1">
        <Stack justify="center" gap={5}>
          {navigationSections
            .filter((section) => section.authenticated === Boolean(credentials))
            .map((section, index) => (
              <Stack justify="center" key={index}>
                <Divider my="xs" />
                {section.options.map((option) => (
                  <NavbarLink
                    {...option}
                    key={option.link}
                    active={option.link === active?.link}
                    onClick={() => navigate(`/${option.link}`)}
                  />
                ))}
              </Stack>
            ))}
        </Stack>
      </Box>
      {credentials && (
        <Stack justify="center" gap={0} className="mt-4">
          <NavbarLink color="red" icon={IconLogout} label={t('actions.logout')} onClick={onLogout} />
        </Stack>
      )}
    </nav>
  );
}

