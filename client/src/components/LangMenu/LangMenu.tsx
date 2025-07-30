import { SUPPORTED_LANGUAGES, type LangOption } from '../../model/lang';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { setSelectedLanguage } from '../../services/store/features/lang/langSlice';
import type { AppState } from '../../model/state';
import { Box, Button, Menu, Text, Tooltip } from '@mantine/core';
import { useMediaQuery } from '@mantine/hooks';
import { MOBILE_MEDIA_QUERY } from '../../constants/media-query';

export default function LangMenu() {
  const { i18n, t } = useTranslation();
  const selectedLanguage: string = useSelector(({ lang }: AppState) => lang.selectedLanguage);
  const dispatch = useDispatch();
  const isMobile = useMediaQuery(MOBILE_MEDIA_QUERY);

  function handleLangMenuItemClick(option: LangOption) {
    return () => {
      dispatch(setSelectedLanguage(option.lang_code));
      i18n.changeLanguage(option.lang_code);
    };
  }

  return (
    <Menu withinPortal position={isMobile ? 'bottom-start' : 'right-start'}>
      <Menu.Target>
        <Tooltip label={t('language.select')} position="right" transitionProps={{ duration: 0 }} withArrow>
          <Button
            variant="default"
            style={{ height: 'max-content' }}
            classNames={
              isMobile
                ? {
                    root: 'w-100 py-3',
                    inner: 'justify-content-start',
                  }
                : {
                    root: 'w-100 py-3 px-0',
                    inner: 'justify-content-center',
                  }
            }
          >
            <Box className="d-flex gap-2 align-items-center">
              <Text size="lg">{SUPPORTED_LANGUAGES.find((option) => option.lang_code === selectedLanguage)?.flag}</Text>
              {isMobile && (
                <span>{SUPPORTED_LANGUAGES.find((option) => option.lang_code === selectedLanguage)?.lang_name}</span>
              )}
            </Box>
          </Button>
        </Tooltip>
      </Menu.Target>
      <Menu.Dropdown>
        {SUPPORTED_LANGUAGES.filter((option) => option.lang_code !== selectedLanguage).map((option) => (
          <Menu.Item key={option.lang_code} onClick={handleLangMenuItemClick(option)}>
            <Box className="d-flex gap-2 align-items-center">
              <Text size="lg">{option.flag}</Text>
              <span>{option.lang_name}</span>
            </Box>
          </Menu.Item>
        ))}
      </Menu.Dropdown>
    </Menu>
  );
}

