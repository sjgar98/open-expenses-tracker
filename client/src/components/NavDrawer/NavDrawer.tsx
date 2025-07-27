import { Box, Divider, IconButton, List, ListItem, ListItemButton, ListItemIcon, ListItemText, SwipeableDrawer, useMediaQuery, } from '@mui/material';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';

import MenuIcon from '@mui/icons-material/Menu';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import PaymentsIcon from '@mui/icons-material/Payments';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import CurrencyExchangeIcon from '@mui/icons-material/CurrencyExchange';
import CreditCardIcon from '@mui/icons-material/CreditCard';

export default function NavDrawer() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const isMobile = useMediaQuery('(max-width:600px)');
  const [isDrawerOpen, setDrawerOpen] = useState(false);

  const primaryNavItems = [
    { label: 'home.title', route: '/home', icon: <AccountBalanceIcon /> },
    { label: 'expenses.title', route: '/expenses', icon: <ReceiptLongIcon /> },
    { label: 'income.title', route: '/income', icon: <PaymentsIcon /> },
  ];

  const configNavItems = [
    { label: 'currencies.title', route: '/currencies', icon: <AttachMoneyIcon /> },
    { label: 'exchangeRates.title', route: '/exchange-rates', icon: <CurrencyExchangeIcon /> },
    { label: 'paymentMethods.title', route: '/payment-methods', icon: <CreditCardIcon /> },
    { label: 'accounts.title', route: '/accounts', icon: <AccountBalanceIcon /> },
  ];

  return (
    <>
      <IconButton
        onClick={() => setDrawerOpen(true)}
        size="large"
        edge="start"
        color="inherit"
        aria-label="menu"
        sx={{ borderRadius: 0, mr: 2 }}
      >
        <MenuIcon />
      </IconButton>
      <SwipeableDrawer open={isDrawerOpen} onOpen={() => setDrawerOpen(true)} onClose={() => setDrawerOpen(false)}>
        <Box sx={{ width: isMobile ? '100vw' : '300px' }}>
          <List>
            {primaryNavItems.map((listItem) => (
              <ListItem key={t(listItem.label)} disablePadding>
                <ListItemButton onClick={() => navigate(listItem.route)}>
                  <ListItemIcon>{listItem.icon}</ListItemIcon>
                  <ListItemText primary={t(listItem.label)}></ListItemText>
                </ListItemButton>
              </ListItem>
            ))}
            {!isMobile && (
              <>
                {primaryNavItems.length && configNavItems.length ? (
                  <Divider variant="middle" aria-hidden="true" sx={{ my: 1 }} />
                ) : null}
                {configNavItems.map((listItem) => (
                  <ListItem key={t(listItem.label)} disablePadding>
                    <ListItemButton onClick={() => navigate(listItem.route)}>
                      <ListItemIcon>{listItem.icon}</ListItemIcon>
                      <ListItemText primary={t(listItem.label)}></ListItemText>
                    </ListItemButton>
                  </ListItem>
                ))}
              </>
            )}
          </List>
        </Box>
      </SwipeableDrawer>
    </>
  );
}

