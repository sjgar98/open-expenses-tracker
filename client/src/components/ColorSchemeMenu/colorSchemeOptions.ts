import type { MantineColorScheme } from '@mantine/core';
import { IconDeviceDesktop, IconMoon, IconSun } from '@tabler/icons-react';
import type { NavigationIcon } from '../../model/navigation';

export interface ColorSchemeOption {
  value: MantineColorScheme;
  icon: NavigationIcon;
  labelKey: string;
}

export const COLOR_SCHEME_OPTIONS: ColorSchemeOption[] = [
  { value: 'auto', icon: IconDeviceDesktop, labelKey: 'colorScheme.auto' },
  { value: 'light', icon: IconSun, labelKey: 'colorScheme.light' },
  { value: 'dark', icon: IconMoon, labelKey: 'colorScheme.dark' },
];
