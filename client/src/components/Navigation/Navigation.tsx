import { IconArrowsExchange, IconBuildingBank, IconCash, IconCreditCard, IconHome2, IconLogin, IconReceipt, IconTax, IconUserPlus, IconWorldDollar, type Icon, type IconProps, } from '@tabler/icons-react';
import { type ForwardRefExoticComponent, type RefAttributes } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router';
import { useMediaQuery } from '@mantine/hooks';
import { clearCredentials } from '../../services/store/features/auth/authSlice';
import Header from '../Header/Header';
import NavBar from '../NavBar/NavBar';
import { MOBILE_MEDIA_QUERY } from '../../constants/media-query';

export interface NavigationOption {
  icon: ForwardRefExoticComponent<IconProps & RefAttributes<Icon>>;
  label: string;
  link: string;
}

export interface NavigationSection {
  authenticated: boolean;
  options: NavigationOption[];
}

export default function Navigation() {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const isMobile = useMediaQuery(MOBILE_MEDIA_QUERY);

  const navigationSections: NavigationSection[] = [
    {
      authenticated: true,
      options: [
        { icon: IconHome2, label: t('home.title'), link: 'home' },
        { icon: IconReceipt, label: t('expenses.title'), link: 'expenses' },
        { icon: IconCash, label: t('income.title'), link: 'income' },
      ],
    },
    {
      authenticated: true,
      options: [
        { icon: IconWorldDollar, label: t('currencies.title'), link: 'currencies' },
        { icon: IconArrowsExchange, label: t('exchangeRates.title'), link: 'exchange-rates' },
        { icon: IconBuildingBank, label: t('accounts.title'), link: 'accounts' },
        { icon: IconCreditCard, label: t('paymentMethods.title'), link: 'payment-methods' },
        { icon: IconTax, label: t('taxes.title'), link: 'taxes' },
      ],
    },
    {
      authenticated: false,
      options: [
        { icon: IconLogin, label: t('login.title'), link: 'login' },
        { icon: IconUserPlus, label: t('register.title'), link: 'register' },
      ],
    },
  ];

  function handleLogout() {
    dispatch(clearCredentials());
    navigate('/');
  }

  return isMobile ? (
    <Header navigationSections={navigationSections} onLogout={handleLogout} />
  ) : (
    <NavBar navigationSections={navigationSections} onLogout={handleLogout} />
  );
}

