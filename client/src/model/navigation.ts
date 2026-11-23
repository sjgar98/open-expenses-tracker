import type { IconProps } from '@tabler/icons-react';
import type { ForwardRefExoticComponent, RefAttributes } from 'react';

export type NavigationIcon = ForwardRefExoticComponent<IconProps & RefAttributes<SVGSVGElement>>;

export interface NavigationOption {
  icon: NavigationIcon;
  label: string;
  link: string;
  admin: boolean;
}

export interface NavigationGroup {
  id: string;
  icon: NavigationIcon;
  label: string;
  options: NavigationOption[];
}

export type NavigationEntry = NavigationOption | NavigationGroup;

export interface NavigationSection {
  authenticated: boolean;
  placement?: 'main' | 'account';
  entries: NavigationEntry[];
}

export function isNavigationGroup(entry: NavigationEntry): entry is NavigationGroup {
  return 'options' in entry;
}

export function flattenOptions(sections: NavigationSection[]): NavigationOption[] {
  return sections.flatMap((section) =>
    section.entries.flatMap((entry) => (isNavigationGroup(entry) ? entry.options : [entry]))
  );
}
