import { createSlice } from '@reduxjs/toolkit';
import { widgets, type HomeState, type WidgetState } from '../../../model/home';

function getInitialState(): HomeState {
  const _enabledWidgets = localStorage.getItem('enabledWidgets');
  const enabledWidgets: WidgetState[] = _enabledWidgets ? JSON.parse(_enabledWidgets) : [];
  enabledWidgets.push(
    ...widgets
      .filter((widget) => !enabledWidgets.find((w) => w.id === widget.id))
      .map((widget) => ({ id: widget.id, visible: true }))
  );
  return {
    enabledWidgets: enabledWidgets,
  };
}

export const homeSlice = createSlice({
  name: 'home',
  initialState: getInitialState() as HomeState,
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

