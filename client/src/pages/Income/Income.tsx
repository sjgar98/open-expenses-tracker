import { useTranslation } from 'react-i18next';
import Layout from '../../components/Layout/Layout';
import RouterTabs, { type RouterTab } from '../../components/RouterTabs/RouterTabs';

export default function Income() {
  const { t } = useTranslation();
  const routerTabs: RouterTab[] = [
    { link: 'onetime', label: t('income.onetime.title') },
    { link: 'recurring', label: t('income.recurring.title') },
  ];

  return (
    <Layout>
      <RouterTabs tabs={routerTabs} depth={2} />
    </Layout>
  );
}

