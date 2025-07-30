import type { NavigationOption } from '../Navigation/Navigation';
import classes from './Header.module.css';
import { Burger, Drawer } from '@mantine/core';
import { IconBrandReact } from '@tabler/icons-react';
import { useDisclosure } from '@mantine/hooks';
import NavBar from '../NavBar/NavBar';

interface HeaderProps {
  navigationOptions: NavigationOption[];
  onLogout: () => void;
}

export default function Header({ navigationOptions, onLogout }: HeaderProps) {
  const [opened, { open, close }] = useDisclosure(false);
  return (
    <>
      <header className={classes.header}>
        <IconBrandReact size={28} />
        <Burger opened={opened} onClick={open} />
      </header>
      <Drawer
        opened={opened}
        onClose={close}
        className={''}
        classNames={{ body: 'flex-grow-1' }}
        styles={{ body: { height: 'calc(100% - 3.75rem * var(--mantine-scale))' } }}
      >
        <NavBar navigationOptions={navigationOptions} onLogout={onLogout} />
      </Drawer>
    </>
  );
}

