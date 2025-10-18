/**
 * Auth Restoration Hook
 *
 * Restores authentication state from secure storage on app initialization.
 * Should be called once at app startup in the root layout.
 *
 * Enhanced to validate token and attempt refresh if access token is expired.
 */

import { useEffect } from 'react';
import { useAppDispatch } from '@/store';
import { restoreCredentials, setAuthLoading, clearCredentials } from '@/store/slices/authSlice';
import { getAuthToken, getRefreshToken, getUserData, clearAuthData } from '@/utils/secureStorage';
import { API_CONFIG } from '@/constants/config';

/**
 * Decode JWT token to check expiration without verification
 * This is a simple check - the backend will do full validation
 */
function isTokenExpired(token: string): boolean {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const exp = payload.exp * 1000; // Convert to milliseconds
    return Date.now() >= exp;
  } catch (error) {
    console.error('[AuthRestore] Error parsing token:', error);
    return true; // Treat as expired if we can't parse
  }
}

export function useAuthRestore() {
  const dispatch = useAppDispatch();

  useEffect(() => {
    const restoreAuth = async () => {
      try {
        console.log('[AuthRestore] Starting auth restoration...');

        // Attempt to get stored auth data
        const [token, refreshToken, userData] = await Promise.all([
          getAuthToken(),
          getRefreshToken(),
          getUserData(),
        ]);

        // If we don't have token or user data, clear everything and return
        if (!token || !userData) {
          console.log('[AuthRestore] No stored credentials found');
          await clearAuthData();
          dispatch(setAuthLoading(false));
          return;
        }

        // Check if access token is expired
        const tokenExpired = isTokenExpired(token);
        console.log('[AuthRestore] Access token expired:', tokenExpired);

        if (tokenExpired) {
          // If access token is expired, check if we have refresh token
          if (!refreshToken) {
            console.log('[AuthRestore] No refresh token available, clearing auth');
            await clearAuthData();
            dispatch(clearCredentials());
            dispatch(setAuthLoading(false));
            return;
          }

          // Check if refresh token is also expired
          const refreshExpired = isTokenExpired(refreshToken);
          console.log('[AuthRestore] Refresh token expired:', refreshExpired);

          if (refreshExpired) {
            console.log('[AuthRestore] Refresh token expired, clearing auth');
            await clearAuthData();
            dispatch(clearCredentials());
            dispatch(setAuthLoading(false));
            return;
          }

          // Try to refresh the access token
          console.log('[AuthRestore] Attempting to refresh access token...');
          try {
            const response = await fetch(`${API_CONFIG.baseUrl}/auth/refresh`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ refreshToken }),
            });

            if (response.ok) {
              const data = await response.json();

              // Unwrap double-wrapped response
              let unwrappedData = data;
              if (unwrappedData?.data?.data) {
                unwrappedData = unwrappedData.data.data;
              } else if (unwrappedData?.data) {
                unwrappedData = unwrappedData.data;
              }

              const { accessToken, refreshToken: newRefreshToken } = unwrappedData;

              console.log('[AuthRestore] Token refresh successful');

              // Restore with new tokens
              dispatch(
                restoreCredentials({
                  token: accessToken,
                  refreshToken: newRefreshToken,
                  user: userData,
                })
              );
            } else {
              console.log('[AuthRestore] Token refresh failed, clearing auth');
              await clearAuthData();
              dispatch(clearCredentials());
              dispatch(setAuthLoading(false));
            }
          } catch (error) {
            console.error('[AuthRestore] Error refreshing token:', error);
            await clearAuthData();
            dispatch(clearCredentials());
            dispatch(setAuthLoading(false));
          }
        } else {
          // Access token is still valid, restore auth state
          console.log('[AuthRestore] Access token still valid, restoring auth');
          dispatch(
            restoreCredentials({
              token,
              refreshToken: refreshToken || undefined,
              user: userData,
            })
          );
        }
      } catch (error) {
        console.error('[AuthRestore] Error restoring auth:', error);
        await clearAuthData();
        dispatch(clearCredentials());
        dispatch(setAuthLoading(false));
      }
    };

    restoreAuth();
  }, [dispatch]);
}
