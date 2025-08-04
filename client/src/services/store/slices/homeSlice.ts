import { createSlice } from '@reduxjs/toolkit';
import { widgets, type HomeState } from '../../../model/home';

export const homeSlice = createSlice({
  name: 'home',
  initialState: {
    enabledWidgets: localStorage.getItem('enabledWidgets')
      ? JSON.parse(localStorage.getItem('enabledWidgets')!)
      : widgets.map((widget) => ({ id: widget.id, visible: true })),
  } as HomeState,
  reducers: {
    setWidgets: (state, action) => {
      state.enabledWidgets = action.payload;
      localStorage.setItem('enabledWidgets', JSON.stringify(state.enabledWidgets));
    },
    reorderWidgets: (state, action) => {
      const { fromIndex, toIndex } = action.payload;
      const [movedWidget] = state.enabledWidgets.splice(fromIndex, 1);
      state.enabledWidgets.splice(toIndex, 0, movedWidget);
      localStorage.setItem('enabledWidgets', JSON.stringify(state.enabledWidgets));
    },
  },
});

export const { setWidgets, reorderWidgets } = homeSlice.actions;
export default homeSlice.reducer;

