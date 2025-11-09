/**
 * Secure Storage Utility
 *
 * Provides encrypted storage for sensitive data like authentication tokens.
 * Uses expo-secure-store on native platforms and sessionStorage with encryption on web.
 */

import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import { AUTH_CONFIG } from '@/constants/config';
import type { User } from '@/types/api';

/**
 * Simple encryption for web storage (better than plain text)
 * NOTE: For production, consider using a robust encryption library
 */
function simpleEncrypt(text: string, key: string = 'vibelist-secret-key'): string {
  try {
    // Base64 encode for basic obfuscation (not true encryption)
    // In production, use crypto-js or similar for real encryption
    const encoded = btoa(encodeURIComponent(text + key));
    return encoded;
  } catch {
    return text;
  }
}

function simpleDecrypt(encodedText: string, key: string = 'vibelist-secret-key'): string {
  try {
    const decoded = decodeURIComponent(atob(encodedText));
    // Remove the key suffix
    return decoded.slice(0, -key.length);
  } catch {
    return encodedText;
  }
}

/**
 * For web platform, use sessionStorage with encryption
 * sessionStorage is cleared when the browser tab is closed, providing better security
 */
const webStorage = {
  async getItem(key: string): Promise<string | null> {
    if (typeof window !== 'undefined') {
      const encrypted = sessionStorage.getItem(key);
      if (encrypted) {
        return simpleDecrypt(encrypted);
      }
    }
    return null;
  },
  async setItem(key: string, value: string): Promise<void> {
    if (typeof window !== 'undefined') {
      const encrypted = simpleEncrypt(value);
      sessionStorage.setItem(key, encrypted);
    }
  },
  async deleteItem(key: string): Promise<void> {
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem(key);
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
 * @returns Promise<boolean> - true if successful, false otherwise
 */
export async function setSecureItem(key: string, value: string): Promise<boolean> {
  try {
    // Validate that value is a string
    if (typeof value !== 'string') {
      const error = new Error(
        `Cannot save to SecureStore. Key "${key}" must be a string, received ${typeof value}`
      );
      console.error(error.message, value);
      throw error;
    }

    // Validate that value is not empty
    if (!value || value.length === 0) {
      const error = new Error(`Cannot save empty value for key "${key}"`);
      console.error(error.message);
      throw error;
    }

    if (Platform.OS === 'web') {
      await webStorage.setItem(key, value);
    } else {
      await SecureStore.setItemAsync(key, value);
    }

    return true;
  } catch (error) {
    console.error(`Error setting secure item ${key}:`, error);
    // Re-throw to allow caller to handle
    throw error;
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

export async function saveUserData(user: User): Promise<boolean> {
  try {
    return await setSecureItem(AUTH_CONFIG.userKey, JSON.stringify(user));
  } catch (error) {
    console.error('Error saving user data:', error);
    return false;
  }
}

export async function getUserData(): Promise<User | null> {
  const data = await getSecureItem(AUTH_CONFIG.userKey);
  if (!data) return null;

  try {
    const parsed = JSON.parse(data) as User;

    // Validate that the parsed data has required User fields
    if (!parsed.id || !parsed.username || !parsed.email) {
      console.error('Invalid user data structure');
      return null;
    }

    return parsed;
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
