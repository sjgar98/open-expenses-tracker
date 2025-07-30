import emojiFlags from 'emoji-flags';

export interface LangOption {
  lang_name: string;
  lang_code: string;
  flag: string;
}

export interface LangState {
  selectedLanguage: string;
}

export const SUPPORTED_LANGUAGES: LangOption[] = [
  { lang_name: 'English', lang_code: 'en', flag: emojiFlags.GB.emoji },
  { lang_name: 'Español', lang_code: 'es', flag: emojiFlags.ES.emoji },
];

