/**
 * Theme Transition Context
 *
 * Manages theme changes without animations.
 */

import React, { createContext, useContext, useCallback } from 'react';
import { useAppDispatch } from '@/store';
import { setTheme } from '@/store/settings-slice';

interface ThemeTransitionContextType {
  /**
   * Changes the theme immediately without animation
   * @param newTheme - The theme to change to
   */
  changeTheme: (newTheme: 'light' | 'dark' | 'auto') => void;
}

const ThemeTransitionContext = createContext<ThemeTransitionContextType | undefined>(
  undefined
);

export function ThemeTransitionProvider({ children }: { children: React.ReactNode }) {
  const dispatch = useAppDispatch();

  const changeTheme = useCallback(
    (newTheme: 'light' | 'dark' | 'auto') => {
      dispatch(setTheme(newTheme));
    },
    [dispatch]
  );

  return (
    <ThemeTransitionContext.Provider value={{ changeTheme }}>
      {children}
    </ThemeTransitionContext.Provider>
  );
}

export function useThemeTransition() {
  const context = useContext(ThemeTransitionContext);
  if (context === undefined) {
    throw new Error('useThemeTransition must be used within ThemeTransitionProvider');
  }
  return context;
}
