import { useLocation, useNavigate } from 'react-router';
import { useSelector } from 'react-redux';
import type { AppState } from '../../model/state';
import { Box, Center, Divider, Stack } from '@mantine/core';
import { useEffect } from 'react';
import { flattenOptions, isNavigationGroup, type NavigationOption, type NavigationSection, } from '../../model/navigation';
import { useMediaQuery } from '@mantine/hooks';
import LangMenu from '../LangMenu/LangMenu';
import ColorSchemeMenu from '../ColorSchemeMenu/ColorSchemeMenu';
import { MOBILE_MEDIA_QUERY } from '../../constants/media-query';
import AppLogo from '../AppLogo/AppLogo';
import NavbarLink from '../NavbarLink/NavbarLink';
import NavGroup from '../NavGroup/NavGroup';
import AccountMenu from '../AccountMenu/AccountMenu';

interface NavBarProps {
  navigationSections: NavigationSection[];
  onLogout: () => void;
}

export default function NavBar({ navigationSections, onLogout }: NavBarProps) {
  const location = useLocation();
  const credentials = useSelector(({ auth }: AppState) => auth.credentials);
  const navigate = useNavigate();
  const isMobile = useMediaQuery(MOBILE_MEDIA_QUERY);

  const isVisible = (option: NavigationOption) => !option.admin || Boolean(credentials?.isAdmin);
  const visibleSections = navigationSections.filter((section) => section.authenticated === Boolean(credentials));
  const mainSections = visibleSections.filter((section) => (section.placement ?? 'main') === 'main');
  const accountOptions = flattenOptions(visibleSections.filter((section) => section.placement === 'account')).filter(
    isVisible
  );

  const currentLink = location.pathname.split('/')[1];
  const active = flattenOptions(navigationSections).find((option) => option.link === currentLink);

  const activeLabel = active?.label;

  useEffect(() => {
    if (activeLabel) {
      document.title = activeLabel;
    }
  }, [activeLabel]);

  function handleNavigate(link: string) {
    navigate(`/${link}`);
  }

  return (
    <nav
      className="h-100 p-2 d-flex flex-column overflow-auto"
      style={{
        width: isMobile ? '100%' : 80,
        backgroundColor: !isMobile ? 'var(--oet-nav-bg)' : undefined,
        borderRight: !isMobile ? '1px solid var(--oet-nav-border)' : undefined,
      }}
    >
      {!isMobile && (
        <Center className="mt-2 mb-3">
          <AppLogo />
        </Center>
      )}
      <Box className="flex-grow-1">
        <Stack justify="center" gap={5}>
          {mainSections.map((section, index) => (
            <Stack justify="center" key={index} gap={5}>
              <Divider my="xs" />
              {section.entries.map((entry) =>
                isNavigationGroup(entry) ? (
                  <NavGroup
                    key={entry.id}
                    group={entry}
                    options={entry.options.filter(isVisible)}
                    activeLink={active?.link}
                    onNavigate={handleNavigate}
                  />
                ) : (
                  isVisible(entry) && (
                    <NavbarLink
                      {...entry}
                      key={entry.link}
                      active={entry.link === active?.link}
                      onClick={() => handleNavigate(entry.link)}
                    />
                  )
                )
              )}
            </Stack>
          ))}
        </Stack>
      </Box>
      <Stack justify="center" gap={5} className="mt-4">
        <Divider my="xs" />
        {credentials ? (
          <AccountMenu
            options={accountOptions}
            activeLink={active?.link}
            onNavigate={handleNavigate}
            onLogout={onLogout}
          />
        ) : (
          <>
            <ColorSchemeMenu />
            <LangMenu />
          </>
        )}
      </Stack>
    </nav>
  );
}
