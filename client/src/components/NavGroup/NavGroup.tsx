import { Box, Collapse, Menu, Stack } from '@mantine/core';
import { useDisclosure, useMediaQuery } from '@mantine/hooks';
import { IconChevronDown } from '@tabler/icons-react';
import { MOBILE_MEDIA_QUERY } from '../../constants/media-query';
import type { NavigationGroup, NavigationOption } from '../../model/navigation';
import NavbarLink from '../NavbarLink/NavbarLink';

interface NavGroupProps {
  group: NavigationGroup;
  options: NavigationOption[];
  activeLink?: string;
  onNavigate: (link: string) => void;
}

export default function NavGroup({ group, options, activeLink, onNavigate }: NavGroupProps) {
  const isMobile = useMediaQuery(MOBILE_MEDIA_QUERY);
  const hasActiveChild = options.some((option) => option.link === activeLink);
  const [expanded, { toggle }] = useDisclosure(hasActiveChild);

  if (options.length === 0) {
    return null;
  }

  if (isMobile) {
    return (
      <>
        <NavbarLink
          icon={group.icon}
          label={group.label}
          onClick={toggle}
          aria-expanded={expanded}
          rightSection={
            <IconChevronDown
              size={16}
              style={{ transform: expanded ? 'rotate(180deg)' : undefined, transition: 'transform 150ms' }}
            />
          }
        />
        <Collapse expanded={expanded}>
          <Stack gap={5} pl="md">
            {options.map((option) => (
              <NavbarLink
                {...option}
                key={option.link}
                active={option.link === activeLink}
                onClick={() => onNavigate(option.link)}
              />
            ))}
          </Stack>
        </Collapse>
      </>
    );
  }

  return (
    <Menu withinPortal position="right-start" offset={12}>
      <Menu.Target>
        <NavbarLink icon={group.icon} label={group.label} active={hasActiveChild} />
      </Menu.Target>
      <Menu.Dropdown>
        <Menu.Label>{group.label}</Menu.Label>
        {options.map(({ icon: Icon, label, link }) => (
          <Menu.Item
            key={link}
            leftSection={<Icon size={18} stroke={1.5} />}
            color={link === activeLink ? 'green' : undefined}
            onClick={() => onNavigate(link)}
          >
            <Box fw={link === activeLink ? 600 : undefined}>{label}</Box>
          </Menu.Item>
        ))}
      </Menu.Dropdown>
    </Menu>
  );
}
