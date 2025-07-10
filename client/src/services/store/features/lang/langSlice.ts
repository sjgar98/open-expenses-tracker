import { createSlice } from '@reduxjs/toolkit';
import { SUPPORTED_LANGUAGES, type LangState } from '../../../../model/lang';

export const langSlice = createSlice({
  name: 'language',
  initialState: {
    selectedLanguage: SUPPORTED_LANGUAGES[0].lang_code,
  } as LangState,
  reducers: {
    setSelectedLanguage: (state, action) => {
      state.selectedLanguage = action.payload;
    },
  },
});

export const { setSelectedLanguage } = langSlice.actions;
export default langSlice.reducer;
