import { IconButton, Menu, MenuItem, Typography } from '@mui/material';
import { useState } from 'react';
import { SUPPORTED_LANGUAGES, type LangOption } from '../../model/lang';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { setSelectedLanguage } from '../../services/store/features/lang/langSlice';
import type { AppState } from '../../model/state';

export default function LangMenu() {
  const { i18n } = useTranslation();
  const selectedLanguage: string = useSelector(({ lang }: AppState) => lang.selectedLanguage);
  const dispatch = useDispatch();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [open, setOpen] = useState<boolean>(false);

  function handleLangMenuOpen(event: React.MouseEvent<HTMLButtonElement>) {
    setOpen(true);
    setAnchorEl(event.currentTarget);
  }
  function handleLangMenuClose() {
    setOpen(false);
    setAnchorEl(null);
  }
  function handleLangMenuItemClick(option: LangOption) {
    return () => {
      dispatch(setSelectedLanguage(option.lang_code));
      i18n.changeLanguage(option.lang_code);
      handleLangMenuClose();
    };
  }

  return (
    <>
      <IconButton onClick={handleLangMenuOpen} aria-label="menu" sx={{ borderRadius: 0, ml: 1 }}>
        {SUPPORTED_LANGUAGES.find((lang) => lang.lang_code === selectedLanguage)!.flag}
      </IconButton>
      <Menu open={open} onClose={handleLangMenuClose} anchorEl={anchorEl}>
        {SUPPORTED_LANGUAGES.filter((lang) => lang.lang_code !== selectedLanguage).map((lang) => (
          <MenuItem key={lang.lang_code} onClick={handleLangMenuItemClick(lang)}>
            <Typography variant="h5">{lang.flag}</Typography>
          </MenuItem>
        ))}
      </Menu>
    </>
  );
}

