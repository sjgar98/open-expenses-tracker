import { IconArrowsExchange, IconBuildingBank, IconCash, IconCreditCard, IconHome2, IconReceipt, IconWorldDollar, type Icon, type IconProps, } from '@tabler/icons-react';
import { type ForwardRefExoticComponent, type RefAttributes } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router';
import { useMediaQuery } from '@mantine/hooks';
import { clearCredentials } from '../../services/store/features/auth/authSlice';
import Header from '../Header/Header';
import NavBar from '../NavBar/NavBar';

export interface NavigationOption {
  icon: ForwardRefExoticComponent<IconProps & RefAttributes<Icon>>;
  label: string;
  link: string;
}

export default function Navigation() {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const isMobile = useMediaQuery('(max-width:600px)');

  const navigationOptions: NavigationOption[] = [
    { icon: IconHome2, label: t('home.title'), link: 'home' },
    { icon: IconReceipt, label: t('expenses.title'), link: 'expenses' },
    { icon: IconCash, label: t('income.title'), link: 'income' },
    { icon: IconWorldDollar, label: t('currencies.title'), link: 'currencies' },
    { icon: IconArrowsExchange, label: t('exchangeRates.title'), link: 'exchange-rates' },
    { icon: IconCreditCard, label: t('paymentMethods.title'), link: 'payment-methods' },
    { icon: IconBuildingBank, label: t('accounts.title'), link: 'accounts' },
  ];

  function handleLogout() {
    dispatch(clearCredentials());
    navigate('/');
  }

  return isMobile ? (
    <Header navigationOptions={navigationOptions} onLogout={handleLogout} />
  ) : (
    <NavBar navigationOptions={navigationOptions} onLogout={handleLogout} />
  );
}

