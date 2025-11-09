import { useColorScheme as useDeviceColorScheme } from 'react-native';
import { useAppSelector } from '@/store';
import { selectTheme } from '@/store/settings-slice';

/**
 * Custom hook that respects user's manual theme preference from settings
 * Falls back to device color scheme when set to 'auto'
 */
export function useColorScheme() {
  const deviceColorScheme = useDeviceColorScheme();
  const userThemePreference = useAppSelector(selectTheme);

  // If user selected a specific theme, use it
  if (userThemePreference === 'light' || userThemePreference === 'dark') {
    return userThemePreference;
  }

  // Otherwise use device preference (auto mode)
  return deviceColorScheme ?? 'light';
}
