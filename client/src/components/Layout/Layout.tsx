import { useMediaQuery } from '@mantine/hooks';
import { Box } from '@mantine/core';
import Navigation from '../Navigation/Navigation';

export default function Layout({ children }: { children?: React.ReactNode }) {
  const isMobile = useMediaQuery('(max-width:600px)');

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: isMobile ? 'column' : 'row' }}>
      <Navigation />
      <Box className="d-flex flex-column flex-grow-1 w-100 h-100 position-relative overflow-y-auto">{children}</Box>
    </div>
  );
}

