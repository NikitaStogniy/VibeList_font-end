/**
 * Secure Storage Utility
 *
 * Provides encrypted storage for sensitive data like authentication tokens.
 * Uses expo-secure-store on native platforms and fallback to AsyncStorage on web.
 */

import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import { AUTH_CONFIG } from '@/constants/config';

/**
 * For web platform, we'll use localStorage as a fallback
 * Note: This is less secure than native SecureStore but necessary for web support
 */
const webStorage = {
  async getItem(key: string): Promise<string | null> {
    if (typeof window !== 'undefined') {
      return localStorage.getItem(key);
    }
    return null;
  },
  async setItem(key: string, value: string): Promise<void> {
    if (typeof window !== 'undefined') {
      localStorage.setItem(key, value);
    }
  },
  async deleteItem(key: string): Promise<void> {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(key);
    }
  },
};

/**
 * Get item from secure storage
 */
export async function getSecureItem(key: string): Promise<string | null> {
  try {
    if (Platform.OS === 'web') {
      return await webStorage.getItem(key);
    }
    return await SecureStore.getItemAsync(key);
  } catch (error) {
    console.error(`Error getting secure item ${key}:`, error);
    return null;
  }
}

/**
 * Set item in secure storage
 */
export async function setSecureItem(key: string, value: string): Promise<void> {
  try {
    // Validate that value is a string
    if (typeof value !== 'string') {
      console.error(
        `Error: Cannot save to SecureStore. Key "${key}" must be a string, received ${typeof value}:`,
        value
      );
      return;
    }

    // Validate that value is not empty
    if (!value || value.length === 0) {
      console.error(`Error: Cannot save empty value for key "${key}"`);
      return;
    }

    if (Platform.OS === 'web') {
      await webStorage.setItem(key, value);
    } else {
      await SecureStore.setItemAsync(key, value);
    }
  } catch (error) {
    console.error(`Error setting secure item ${key}:`, error);
  }
}

/**
 * Delete item from secure storage
 */
export async function deleteSecureItem(key: string): Promise<void> {
  try {
    if (Platform.OS === 'web') {
      await webStorage.deleteItem(key);
    } else {
      await SecureStore.deleteItemAsync(key);
    }
  } catch (error) {
    console.error(`Error deleting secure item ${key}:`, error);
  }
}

/**
 * Authentication Token Management
 */

export async function saveAuthToken(token: string): Promise<void> {
  await setSecureItem(AUTH_CONFIG.tokenKey, token);
}

export async function getAuthToken(): Promise<string | null> {
  return await getSecureItem(AUTH_CONFIG.tokenKey);
}

export async function deleteAuthToken(): Promise<void> {
  await deleteSecureItem(AUTH_CONFIG.tokenKey);
}

export async function saveRefreshToken(token: string): Promise<void> {
  await setSecureItem(AUTH_CONFIG.refreshTokenKey, token);
}

export async function getRefreshToken(): Promise<string | null> {
  return await getSecureItem(AUTH_CONFIG.refreshTokenKey);
}

export async function deleteRefreshToken(): Promise<void> {
  await deleteSecureItem(AUTH_CONFIG.refreshTokenKey);
}

/**
 * User Data Management
 */

export async function saveUserData(user: any): Promise<void> {
  await setSecureItem(AUTH_CONFIG.userKey, JSON.stringify(user));
}

export async function getUserData(): Promise<any | null> {
  const data = await getSecureItem(AUTH_CONFIG.userKey);
  if (!data) return null;
  try {
    return JSON.parse(data);
  } catch (error) {
    console.error('Error parsing user data:', error);
    return null;
  }
}

export async function deleteUserData(): Promise<void> {
  await deleteSecureItem(AUTH_CONFIG.userKey);
}

/**
 * Clear all authentication data
 */
export async function clearAuthData(): Promise<void> {
  await Promise.all([
    deleteAuthToken(),
    deleteRefreshToken(),
    deleteUserData(),
  ]);
}
