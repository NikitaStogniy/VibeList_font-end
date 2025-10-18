import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface UiState {
  isAddItemBottomSheetOpen: boolean;
  isLoading: boolean;
  error: string | null;
  toast: {
    message: string;
    type: 'success' | 'error' | 'info';
    visible: boolean;
  };
}

const initialState: UiState = {
  isAddItemBottomSheetOpen: false,
  isLoading: false,
  error: null,
  toast: {
    message: '',
    type: 'info',
    visible: false,
  },
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    openAddItemBottomSheet: (state) => {
      state.isAddItemBottomSheetOpen = true;
    },
    closeAddItemBottomSheet: (state) => {
      state.isAddItemBottomSheetOpen = false;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    showToast: (state, action: PayloadAction<{ message: string; type: 'success' | 'error' | 'info' }>) => {
      state.toast.message = action.payload.message;
      state.toast.type = action.payload.type;
      state.toast.visible = true;
    },
    hideToast: (state) => {
      state.toast.visible = false;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
});

export const {
  openAddItemBottomSheet,
  closeAddItemBottomSheet,
  setLoading,
  setError,
  showToast,
  hideToast,
  clearError,
} = uiSlice.actions;

export default uiSlice.reducer;
