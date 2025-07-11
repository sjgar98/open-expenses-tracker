import { AppBar, Box, IconButton, Toolbar, Typography, useMediaQuery } from '@mui/material';
import { useCookies } from 'react-cookie';
import { useNavigate } from 'react-router';
import LangMenu from '../LangMenu/LangMenu';
import NavDrawer from '../NavDrawer/NavDrawer';
import LogoutIcon from '@mui/icons-material/Logout';
import type { CookieValues } from '../../model/auth';
import { useDispatch, useSelector } from 'react-redux';
import { clearCredentials } from '../../services/store/features/auth/authSlice';

export default function Header({ location }: { location: string }) {
  const [, , removeCookie] = useCookies<'oet_auth_jwt', CookieValues>(['oet_auth_jwt']);
  const credentials = useSelector((state: any) => state.auth.credentials);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const isMobile = useMediaQuery('(max-width:600px)');

  function handleLogout() {
    removeCookie('oet_auth_jwt');
    dispatch(clearCredentials());
    navigate('/');
  }

  return (
    <AppBar position="sticky">
      <Toolbar variant="dense">
        <NavDrawer />
        <Box sx={{ flexGrow: 1 }}>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            {location}
          </Typography>
        </Box>
        {credentials && (
          <>
            {!isMobile && <div>{credentials.name}</div>}
            <IconButton color="error" sx={{ borderRadius: 0, ml: 1 }} onClick={handleLogout}>
              <LogoutIcon />
            </IconButton>
          </>
        )}
        <LangMenu />
      </Toolbar>
    </AppBar>
  );
}
