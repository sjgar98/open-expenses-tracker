import type { NavigationSection } from '../Navigation/Navigation';
import classes from './Header.module.css';
import { Burger, Drawer } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import NavBar from '../NavBar/NavBar';
import AppLogo from '../AppLogo/AppLogo';

interface HeaderProps {
  navigationSections: NavigationSection[];
  onLogout: () => void;
}

export default function Header({ navigationSections, onLogout }: HeaderProps) {
  const [opened, { open, close }] = useDisclosure(false);
  return (
    <>
      <header className={classes.header}>
        <AppLogo />
        <Burger opened={opened} onClick={open} />
      </header>
      <Drawer
        opened={opened}
        onClose={close}
        className={''}
        classNames={{ body: 'flex-grow-1' }}
        styles={{ body: { height: 'calc(100% - 3.75rem * var(--mantine-scale))' } }}
      >
        <NavBar navigationSections={navigationSections} onLogout={onLogout} />
      </Drawer>
    </>
  );
}

