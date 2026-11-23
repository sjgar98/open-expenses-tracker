import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';
import { setSelectedLanguage } from '../../services/store/slices/langSlice';

export function useChangeLanguage() {
  const { i18n } = useTranslation();
  const dispatch = useDispatch();

  return (langCode: string) => {
    dispatch(setSelectedLanguage(langCode));
    i18n.changeLanguage(langCode);
  };
}
