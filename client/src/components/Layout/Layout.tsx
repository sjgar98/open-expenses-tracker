import { useMediaQuery } from '@mantine/hooks';
import { Box } from '@mantine/core';
import Navigation from '../Navigation/Navigation';
import { MOBILE_MEDIA_QUERY } from '../../constants/media-query';

export default function Layout({ children }: { children?: React.ReactNode }) {
  const isMobile = useMediaQuery(MOBILE_MEDIA_QUERY);

  return (
    <div style={{ height: '100vh', width: '100vw', display: 'flex', flexDirection: isMobile ? 'column' : 'row' }}>
      <Navigation />
      <Box className="d-flex flex-column flex-grow-1 w-100 h-100 position-relative overflow-y-auto overflow-x-hidden">
        {children}
      </Box>
    </div>
  );
}

