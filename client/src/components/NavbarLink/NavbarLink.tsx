import { Box, Button, Tooltip, type DefaultMantineColor } from '@mantine/core';
import { useMediaQuery } from '@mantine/hooks';
import type { ComponentPropsWithRef, ReactNode } from 'react';
import { MOBILE_MEDIA_QUERY } from '../../constants/media-query';
import type { NavigationIcon } from '../../model/navigation';

interface NavbarLinkProps extends Omit<ComponentPropsWithRef<'button'>, 'color' | 'style'> {
  icon: NavigationIcon;
  label: string;
  active?: boolean;
  color?: DefaultMantineColor;
  rightSection?: ReactNode;
}

export default function NavbarLink({
  icon: Icon,
  label,
  active,
  color,
  rightSection,
  ...buttonProps
}: NavbarLinkProps) {
  const isMobile = useMediaQuery(MOBILE_MEDIA_QUERY);
  return (
    <Tooltip label={label} position="right" transitionProps={{ duration: 0 }} withArrow disabled={isMobile}>
      <Button
        {...buttonProps}
        variant={active ? 'filled' : 'subtle'}
        color={color ?? 'green'}
        style={{ height: 'max-content' }}
        rightSection={isMobile ? rightSection : undefined}
        classNames={
          isMobile
            ? {
                root: 'py-2',
                inner: 'justify-content-start',
                label: 'flex-grow-1',
              }
            : {
                root: 'py-2 px-0',
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
