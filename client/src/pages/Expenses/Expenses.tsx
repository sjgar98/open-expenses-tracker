import { useTranslation } from 'react-i18next';
import Layout from '../../components/Layout/Layout';
import RouterTabs, { type RouterTab } from '../../components/RouterTabs/RouterTabs';

export default function Expenses() {
  const { t } = useTranslation();
  const routerTabs: RouterTab[] = [
    { link: 'onetime', label: t('expenses.onetime.title') },
    { link: 'recurring', label: t('expenses.recurring.title') },
  ];

  return (
    <Layout>
      <RouterTabs tabs={routerTabs} depth={2} />
    </Layout>
  );
}

