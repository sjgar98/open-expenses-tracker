import { useTranslation } from 'react-i18next';
import Header from '../../components/Header/Header';

export default function Home() {
  const { t } = useTranslation();

  return (
    <>
      <Header location={t('home.title')} />
    </>
  );
}
