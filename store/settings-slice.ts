import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { RootState } from './index';

export interface SettingsState {
  theme: 'light' | 'dark' | 'auto';
  pushNotifications: boolean;
  emailNotifications: boolean;
}

const initialState: SettingsState = {
  theme: 'auto',
  pushNotifications: true,
  emailNotifications: true,
};

const settingsSlice = createSlice({
  name: 'settings',
  initialState,
  reducers: {
    setTheme: (state, action: PayloadAction<'light' | 'dark' | 'auto'>) => {
      state.theme = action.payload;
    },
    setPushNotifications: (state, action: PayloadAction<boolean>) => {
      state.pushNotifications = action.payload;
    },
    setEmailNotifications: (state, action: PayloadAction<boolean>) => {
      state.emailNotifications = action.payload;
    },
    resetSettings: () => initialState,
  },
});

export const {
  setTheme,
  setPushNotifications,
  setEmailNotifications,
  resetSettings,
} = settingsSlice.actions;

export const selectSettings = (state: RootState) => state.settings;
export const selectTheme = (state: RootState) => state.settings.theme;
export const selectPushNotifications = (state: RootState) => state.settings.pushNotifications;
export const selectEmailNotifications = (state: RootState) => state.settings.emailNotifications;

export default settingsSlice.reducer;
