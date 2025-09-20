
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface UIState {
  theme: 'light' | 'dark' | 'auto';
  viewMode: 'grid' | 'list';
  bottomSheetVisible: boolean;
  currentBottomSheet: string | null;
  fabVisible: boolean;
}

const initialState: UIState = {
  theme: 'light',
  viewMode: 'grid',
  bottomSheetVisible: false,
  currentBottomSheet: null,
  fabVisible: true,
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    setTheme: (state, action: PayloadAction<'light' | 'dark' | 'auto'>) => {
      state.theme = action.payload;
    },
    setViewMode: (state, action: PayloadAction<'grid' | 'list'>) => {
      state.viewMode = action.payload;
    },
    showBottomSheet: (state, action: PayloadAction<string>) => {
      state.bottomSheetVisible = true;
      state.currentBottomSheet = action.payload;
    },
    hideBottomSheet: (state) => {
      state.bottomSheetVisible = false;
      state.currentBottomSheet = null;
    },
    setFabVisible: (state, action: PayloadAction<boolean>) => {
      state.fabVisible = action.payload;
    },
  },
});

export const {
  setTheme,
  setViewMode,
  showBottomSheet,
  hideBottomSheet,
  setFabVisible,
} = uiSlice.actions;

export default uiSlice.reducer;
