import { IconArrowsExchange, IconBuildingBank, IconCalendarDollar, IconCash, IconChartBar, IconCreditCard, IconHome2, IconLogin, IconReceipt, IconSettings, IconTag, IconTax, IconTransferIn, IconUserPlus, IconWorldDollar, type Icon, type IconProps, } from '@tabler/icons-react';
import { type ForwardRefExoticComponent, type RefAttributes } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router';
import { useMediaQuery } from '@mantine/hooks';
import { clearCredentials } from '../../services/store/slices/authSlice';
import Header from '../Header/Header';
import NavBar from '../NavBar/NavBar';
import { MOBILE_MEDIA_QUERY } from '../../constants/media-query';

export interface NavigationOption {
  icon: ForwardRefExoticComponent<IconProps & RefAttributes<Icon>>;
  label: string;
  link: string;
  admin: boolean;
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
        { icon: IconHome2, label: t('home.title'), link: 'home', admin: false },
        { icon: IconChartBar, label: t('stats.title'), link: 'stats', admin: false },
        { icon: IconReceipt, label: t('expenses.title'), link: 'expenses', admin: false },
        { icon: IconCash, label: t('income.title'), link: 'income', admin: false },
      ],
    },
    {
      authenticated: true,
      options: [
        { icon: IconWorldDollar, label: t('currencies.title'), link: 'currencies', admin: true },
        { icon: IconArrowsExchange, label: t('exchangeRates.title'), link: 'exchange-rates', admin: true },
        {
          icon: IconCalendarDollar,
          label: t('historicExchangeRates.title'),
          link: 'historic-exchange-rates',
          admin: true,
        },
        { icon: IconBuildingBank, label: t('accounts.title'), link: 'accounts', admin: false },
        { icon: IconCreditCard, label: t('paymentMethods.title'), link: 'payment-methods', admin: false },
        { icon: IconTax, label: t('taxes.title'), link: 'taxes', admin: false },
        { icon: IconTag, label: t('expenseCategories.title'), link: 'expense-categories', admin: false },
        { icon: IconTransferIn, label: t('incomeSources.title'), link: 'income-sources', admin: false },
      ],
    },
    {
      authenticated: true,
      options: [{ icon: IconSettings, label: t('settings.title'), link: 'settings', admin: false }],
    },
    {
      authenticated: false,
      options: [
        { icon: IconLogin, label: t('login.title'), link: 'login', admin: false },
        { icon: IconUserPlus, label: t('register.title'), link: 'signup', admin: false },
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

