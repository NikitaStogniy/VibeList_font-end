/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

import { Platform } from 'react-native';
import { DarkTheme as NavigationDarkTheme, DefaultTheme as NavigationDefaultTheme } from '@react-navigation/native';
import type { Theme } from '@react-navigation/native';

const tintColorLight = '#0a7ea4';
const tintColorDark = '#4A9FD8';

export const Colors = {
  light: {
    text: '#11181C',
    textSecondary: '#687076',
    background: '#fff',
    backgroundSecondary: '#f8f9fa',
    backgroundTertiary: '#e9ecef',
    modalBackground: '#f5f5f5', // Немного темнее для модальных окон
    tint: tintColorLight,
    icon: '#687076',
    tabIconDefault: '#687076',
    tabIconSelected: tintColorLight,
    border: '#E5E5E7',
    borderLight: '#f0f0f0',
    card: '#fff',
    success: '#4CAF50',
    warning: '#FF9800',
    error: '#FF6B6B',
    reserved: '#FF6B6B',
    link: '#0a7ea4',
    // Badge colors
    badge: '#f0f0f0',
    badgeText: '#666',
    ownItemBorder: '#888',
  },
  dark: {
    text: '#ECEDEE',
    textSecondary: '#9BA1A6',
    background: '#000000',
    backgroundSecondary: '#1C1C1E',
    backgroundTertiary: '#2C2C2E',
    modalBackground: '#1a1a1a', // Немного светлее для модальных окон
    tint: tintColorDark,
    icon: '#9BA1A6',
    tabIconDefault: '#9BA1A6',
    tabIconSelected: tintColorDark,
    border: '#38383A',
    borderLight: '#2C2C2E',
    card: '#1C1C1E',
    success: '#4CAF50',
    warning: '#FF9800',
    error: '#FF6B6B',
    reserved: '#FF6B6B',
    link: '#4A9FD8',
    // Badge colors
    badge: '#2C2C2E',
    badgeText: '#9BA1A6',
    ownItemBorder: '#636366',
  },
};

// Custom React Navigation themes that match our color scheme
export const LightTheme: Theme = {
  ...NavigationDefaultTheme,
  colors: {
    ...NavigationDefaultTheme.colors,
    primary: Colors.light.tint,
    background: Colors.light.background,
    card: Colors.light.card,
    text: Colors.light.text,
    border: Colors.light.border,
    notification: Colors.light.tint,
  },
};

export const DarkTheme: Theme = {
  ...NavigationDarkTheme,
  colors: {
    ...NavigationDarkTheme.colors,
    primary: Colors.dark.tint,
    background: Colors.dark.background,
    card: Colors.dark.card,
    text: Colors.dark.text,
    border: Colors.dark.border,
    notification: Colors.dark.tint,
  },
};

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: 'system-ui',
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: 'ui-serif',
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: 'ui-rounded',
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});
