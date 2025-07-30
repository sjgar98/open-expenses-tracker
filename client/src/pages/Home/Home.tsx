import { useTranslation } from 'react-i18next';
import Layout from '../../components/Layout/Layout';

export default function Home() {
  const { t } = useTranslation();

  return (
    <>
      <Layout></Layout>
    </>
  );
}

