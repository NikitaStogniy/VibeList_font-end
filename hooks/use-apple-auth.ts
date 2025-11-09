import { useState, useCallback } from 'react';
import { Platform } from 'react-native';
import Constants from 'expo-constants';
import appleAuth from '@invertase/react-native-apple-authentication';
import { useAppleLoginMutation } from '@/store/api';
import { router } from 'expo-router';
import 'react-native-get-random-values';
import { v4 as uuid } from 'uuid';

interface UseAppleAuthReturn {
  signInWithApple: () => Promise<void>;
  isLoading: boolean;
  error: string | null;
  isSupported: boolean;
}

/**
 * Custom hook for Apple Sign-In authentication
 *
 * This hook handles the complete Apple authentication flow:
 * 1. Initiates Apple Sign-In request
 * 2. Receives identity token and user info
 * 3. Sends to backend for verification
 * 4. Stores JWT tokens and user data
 * 5. Navigates to main app
 *
 * @returns {UseAppleAuthReturn} Sign-in function, loading state, error, and support status
 *
 * @example
 * ```tsx
 * const { signInWithApple, isLoading, error, isSupported } = useAppleAuth();
 *
 * if (!isSupported) return null;
 *
 * return (
 *   <AppleButton onPress={signInWithApple} />
 * );
 * ```
 */
export function useAppleAuth(): UseAppleAuthReturn {
  const [appleLogin, { isLoading: isMutationLoading }] = useAppleLoginMutation();
  const [localError, setLocalError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Check if Apple Sign-In is supported (iOS 13+ only)
  const isSupported = Platform.OS === 'ios' && appleAuth?.isSupported === true;

  const signInWithApple = useCallback(async () => {
    if (!isSupported || !appleAuth) {
      setLocalError('Apple Sign-In is not supported on this device');
      return;
    }

    // Clear previous errors
    setLocalError(null);
    setIsProcessing(true);

    try {
      // Generate a random nonce for security
      const nonce = uuid();

      console.log('[AppleAuth] Starting Apple Sign-In request...');

      // Perform Apple Sign-In request
      const appleAuthRequestResponse = await appleAuth.performRequest({
        requestedOperation: appleAuth.Operation.LOGIN,
        // Note: FULL_NAME should be first (see issue #293 in react-native-apple-authentication)
        requestedScopes: [appleAuth.Scope.FULL_NAME, appleAuth.Scope.EMAIL],
        nonce,
      });

      console.log('[AppleAuth] Apple Sign-In response received');

      // Extract the identity token
      const { identityToken, fullName } = appleAuthRequestResponse;

      if (!identityToken) {
        throw new Error('No identity token returned from Apple');
      }

      // Verify credential state (only works on real devices, not simulator)
      try {
        const credentialState = await appleAuth.getCredentialStateForUser(
          appleAuthRequestResponse.user
        );
        console.log('[AppleAuth] Credential state:', credentialState);

        if (credentialState !== appleAuth.State.AUTHORIZED) {
          throw new Error('Apple credentials not authorized');
        }
      } catch (credentialError) {
        // On simulator, this will fail. Continue anyway in development.
        console.warn('[AppleAuth] Credential state check failed (this is expected on simulator):', credentialError);
      }

      // Prepare user info (only available on first sign-in)
      let userInfo: string | undefined;
      if (fullName?.givenName || fullName?.familyName) {
        userInfo = JSON.stringify({
          firstName: fullName.givenName || '',
          lastName: fullName.familyName || '',
        });
        console.log('[AppleAuth] User info available (first sign-in):', userInfo);
      } else {
        console.log('[AppleAuth] No user info (subsequent sign-in)');
      }

      console.log('[AppleAuth] Sending identity token to backend...');

      // Send to backend for verification
      const result = await appleLogin({
        identityToken,
        user: userInfo,
      }).unwrap();

      console.log('[AppleAuth] Backend authentication successful:', result.user.username);

      // Navigation is handled automatically by auth state change
      router.replace('/(tabs)');
    } catch (error: any) {
      console.error('[AppleAuth] Sign-In error:', error);

      // Handle specific error codes
      if (appleAuth?.Error && error.code === appleAuth.Error.CANCELED) {
        setLocalError('Sign-In was canceled');
      } else if (appleAuth?.Error && error.code === appleAuth.Error.FAILED) {
        setLocalError('Apple Sign-In failed. Please try again.');
      } else if (appleAuth?.Error && error.code === appleAuth.Error.NOT_HANDLED) {
        setLocalError('Sign-In request was not handled');
      } else if (appleAuth?.Error && error.code === appleAuth.Error.UNKNOWN) {
        setLocalError('An unknown error occurred');
      } else if (error.data?.message) {
        // Backend error
        setLocalError(error.data.message);
      } else if (error.message) {
        setLocalError(error.message);
      } else {
        setLocalError('Failed to sign in with Apple. Please try again.');
      }
    } finally {
      setIsProcessing(false);
    }
  }, [isSupported, appleLogin]);

  return {
    signInWithApple,
    isLoading: isProcessing || isMutationLoading,
    error: localError,
    isSupported,
  };
}
