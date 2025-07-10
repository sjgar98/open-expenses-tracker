import { useTranslation } from 'react-i18next';
import Header from '../../components/Header/Header';
import { Tab, Tabs } from '@mui/material';
import { useState } from 'react';
import { Link, Outlet } from 'react-router';

export default function Expenses() {
  const { t } = useTranslation();
  const [currentTab, setCurrentTab] = useState<string>('recurring');

  function handleChange(_: React.SyntheticEvent, newValue: string) {
    setCurrentTab(newValue);
  }

  const tabs = [
    { path: 'recurring', label: t('expenses.recurring.title') },
    { path: 'onetime', label: t('expenses.onetime.title') },
  ];

  return (
    <>
      <Header location={t('expenses.title')} />
      <Tabs value={currentTab} onChange={handleChange}>
        {tabs.map((tab) => (
          <Tab key={tab.path} value={tab.path} to={tab.path} component={Link} label={tab.label} wrapped />
        ))}
      </Tabs>
      <Outlet />
    </>
  );
}
