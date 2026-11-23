import { useTranslation } from 'react-i18next';

interface AppLogoProps {
  size?: number;
}

export default function AppLogo({ size = 32 }: AppLogoProps) {
  const { t } = useTranslation();
  return <img src="/logo.svg" width={size} height={size} alt={t('appName')} />;
}
