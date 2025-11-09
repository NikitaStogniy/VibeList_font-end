import { useState, useCallback } from 'react';
import { Platform } from 'react-native';
import { GoogleSignin, statusCodes } from '@react-native-google-signin/google-signin';
import { useGoogleLoginMutation } from '@/store/api';
import { router } from 'expo-router';
import { GOOGLE_SIGNIN_CONFIG, isGoogleSignInConfigured } from '@/constants/google-signin-config';

interface UseGoogleAuthReturn {
  signInWithGoogle: () => Promise<void>;
  isLoading: boolean;
  error: string | null;
  isConfigured: boolean;
}

/**
 * Custom hook for Google Sign-In authentication
 *
 * This hook handles the complete Google authentication flow:
 * 1. Initiates Google Sign-In request
 * 2. Receives ID token and user info
 * 3. Sends to backend for verification
 * 4. Stores JWT tokens and user data
 * 5. Navigates to main app
 *
 * @returns {UseGoogleAuthReturn} Sign-in function, loading state, error, and configuration status
 *
 * @example
 * ```tsx
 * const { signInWithGoogle, isLoading, error, isConfigured } = useGoogleAuth();
 *
 * if (!isConfigured) return null;
 *
 * return (
 *   <GoogleLogoButton onPress={signInWithGoogle} />
 * );
 * ```
 */
export function useGoogleAuth(): UseGoogleAuthReturn {
  const [googleLogin, { isLoading: isMutationLoading }] = useGoogleLoginMutation();
  const [localError, setLocalError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isConfigured, setIsConfigured] = useState(false);

  // Configure Google Sign-In on hook initialization
  // This should be done once at app startup, but we do it here for safety
  const configureGoogleSignIn = useCallback(async () => {
    try {
      // Check if client IDs are configured
      if (!isGoogleSignInConfigured()) {
        console.warn('[GoogleAuth] Google Sign-In is not configured. Please add your Client IDs.');
        console.warn('[GoogleAuth] Edit constants/google-signin-config.ts with your Google Cloud Console credentials.');
        console.warn('[GoogleAuth] See GOOGLE_OAUTH_SETUP.md for setup instructions.');
        setIsConfigured(false);
        return;
      }

      await GoogleSignin.configure({
        webClientId: GOOGLE_SIGNIN_CONFIG.webClientId,
        iosClientId: GOOGLE_SIGNIN_CONFIG.iosClientId,
        offlineAccess: GOOGLE_SIGNIN_CONFIG.offlineAccess,
        scopes: GOOGLE_SIGNIN_CONFIG.scopes,
      });
      setIsConfigured(true);
      console.log('[GoogleAuth] Google Sign-In configured successfully');
    } catch (error: any) {
      console.error('[GoogleAuth] Configuration error:', error);
      console.error('[GoogleAuth] Please check constants/google-signin-config.ts and GOOGLE_OAUTH_SETUP.md');
      setIsConfigured(false);
      setLocalError(error.message || 'Failed to configure Google Sign-In');
    }
  }, []);

  // Configure on first render
  useState(() => {
    configureGoogleSignIn();
  });

  const signInWithGoogle = useCallback(async () => {
    if (!isConfigured) {
      setLocalError('Google Sign-In is not configured');
      return;
    }

    // Clear previous errors
    setLocalError(null);
    setIsProcessing(true);

    try {
      console.log('[GoogleAuth] Starting Google Sign-In...');

      // Check if Google Play Services are available (Android only)
      if (Platform.OS === 'android') {
        await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
      }

      // Perform Google Sign-In
      const userInfo = await GoogleSignin.signIn();
      console.log('[GoogleAuth] Google Sign-In response received');

      // Extract the ID token
      const idToken = userInfo.data?.idToken;

      if (!idToken) {
        throw new Error('No ID token returned from Google');
      }

      console.log('[GoogleAuth] ID token obtained, sending to backend...');

      // Send to backend for verification
      const result = await googleLogin({
        idToken,
      }).unwrap();

      console.log('[GoogleAuth] Backend authentication successful:', result.user.username);

      // Navigation is handled automatically by auth state change
      router.replace('/(tabs)');
    } catch (error: any) {
      console.error('[GoogleAuth] Sign-In error:', error);

      // Handle specific Google Sign-In error codes
      if (error.code === statusCodes.SIGN_IN_CANCELLED) {
        setLocalError('Sign-In was canceled');
      } else if (error.code === statusCodes.IN_PROGRESS) {
        setLocalError('Sign-In is already in progress');
      } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
        setLocalError('Google Play Services not available');
      } else if (error.data?.message) {
        // Backend error
        setLocalError(error.data.message);
      } else if (error.message) {
        setLocalError(error.message);
      } else {
        setLocalError('Failed to sign in with Google. Please try again.');
      }
    } finally {
      setIsProcessing(false);
    }
  }, [isConfigured, googleLogin]);

  return {
    signInWithGoogle,
    isLoading: isProcessing || isMutationLoading,
    error: localError,
    isConfigured,
  };
}
