/**
 * Auth Helper Utilities
 *
 * Centralized authentication helpers to avoid circular dependencies
 * between store/api.ts and store/slices/authSlice.ts
 */

import type { AppDispatch } from '@/store';
import { clearAuthData } from './secureStorage';
import { router } from 'expo-router';

/**
 * Handles authentication errors by clearing credentials and storage
 */
export async function handleAuthError(dispatch: AppDispatch): Promise<void> {
  try {
    // Dynamically import to avoid circular dependency
    const { clearCredentials } = await import('@/store/slices/authSlice');

    // Clear Redux state
    dispatch(clearCredentials());

    // Clear secure storage
    await clearAuthData();

    console.log('[AuthHelpers] Authentication cleared due to error');

    // Navigate to login screen
    // Use setTimeout to ensure navigation happens after state is cleared
    setTimeout(() => {
      router.replace('/auth/login');
    }, 100);
  } catch (error) {
    console.error('[AuthHelpers] Error during auth cleanup:', error);
    throw error;
  }
}

/**
 * Updates authentication credentials in Redux store
 */
export async function updateAuthCredentials(
  dispatch: AppDispatch,
  payload: {
    user: {
      id: string;
      username: string;
      email: string;
      displayName: string;
      avatarUrl?: string;
      bio?: string;
      followersCount: number;
      followingCount: number;
      createdAt: string;
    };
    token: string;
    refreshToken: string;
  }
): Promise<void> {
  try {
    // Dynamically import to avoid circular dependency
    const { setCredentials } = await import('@/store/slices/authSlice');

    // Update Redux state
    dispatch(setCredentials(payload));

    console.log('[AuthHelpers] Authentication credentials updated');
  } catch (error) {
    console.error('[AuthHelpers] Error updating credentials:', error);
    throw error;
  }
}
