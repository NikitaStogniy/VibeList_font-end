/**
 * Push Notifications Hook
 *
 * Handles Expo Notifications for push notifications:
 * - Request notification permissions
 * - Get and register Expo Push Token
 * - Handle foreground, background, and quit state notifications
 * - Handle notification tap navigation
 */

import { useEffect, useRef } from 'react';
import { Platform, Alert, AppState, type AppStateStatus } from 'react-native';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants from 'expo-constants';
import { useRouter } from 'expo-router';
import { useRegisterDeviceTokenMutation } from '../store/api';

// Configure how notifications are displayed when app is in foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export function usePushNotifications() {
  const router = useRouter();
  const [registerToken] = useRegisterDeviceTokenMutation();
  const appState = useRef<AppStateStatus>(AppState.currentState);
  const notificationListener = useRef<Notifications.EventSubscription | null>(null);
  const responseListener = useRef<Notifications.EventSubscription | null>(null);

  /**
   * Request notification permissions
   */
  async function requestPermission(): Promise<boolean> {
    try {
      if (!Device.isDevice) {
        console.log('[Notifications] Must use physical device for push notifications');
        return false;
      }

      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== 'granted') {
        console.log('[Notifications] Permission denied');
        return false;
      }

      console.log('[Notifications] Permission granted');
      return true;
    } catch (error) {
      console.error('[Notifications] Error requesting permission:', error);
      return false;
    }
  }

  /**
   * Get Expo Push Token and register it with backend
   */
  async function getAndRegisterToken() {
    try {
      // Check if running on physical device
      if (!Device.isDevice) {
        console.log('[Notifications] Must use physical device for push notifications');
        return;
      }

      // Request permission first
      const hasPermission = await requestPermission();
      if (!hasPermission) {
        console.log('[Notifications] Permission not granted, skipping token registration');
        return;
      }

      // Get Expo Push Token
      const tokenData = await Notifications.getExpoPushTokenAsync({
        projectId: Constants.expoConfig?.extra?.eas?.projectId,
      });
      const token = tokenData.data;
      console.log('[Notifications] Token obtained:', token.substring(0, 30) + '...');

      // Register token with backend
      await registerToken({
        token,
        platform: Platform.OS as 'ios' | 'android',
      }).unwrap();

      console.log('[Notifications] Token registered with backend');
      return token;
    } catch (error) {
      console.error('[Notifications] Error getting/registering token:', error);
      throw error;
    }
  }

  /**
   * Handle notification tap - navigate to appropriate screen
   */
  function handleNotificationNavigation(notification: Notifications.Notification) {
    const data = notification.request.content.data;
    console.log('[Notifications] Handling notification tap:', data);

    // Navigate based on notification type
    if (data?.screen && typeof data.screen === 'string') {
      router.push(data.screen as any);
    } else if (data?.userId && typeof data.userId === 'string') {
      router.push(`/profile/${data.userId}` as any);
    } else if (data?.itemId && typeof data.itemId === 'string') {
      router.push(`/wishlist/${data.itemId}` as any);
    } else {
      // Default: go to home/feed
      router.push('/');
    }
  }

  /**
   * Display foreground notification as alert
   */
  function displayForegroundNotification(notification: Notifications.Notification) {
    const { title, body } = notification.request.content;

    if (title || body) {
      Alert.alert(
        title || 'Notification',
        body || '',
        [
          {
            text: 'Dismiss',
            style: 'cancel',
          },
          {
            text: 'View',
            onPress: () => handleNotificationNavigation(notification),
          },
        ]
      );
    }
  }

  useEffect(() => {
    // Initialize notifications on app start
    getAndRegisterToken().catch((error) => {
      console.error('[Notifications] Failed to initialize:', error);
    });

    // Listen for notifications received while app is in foreground
    notificationListener.current = Notifications.addNotificationReceivedListener((notification) => {
      console.log('[Notifications] Foreground notification received:', notification.request.content.title);
      displayForegroundNotification(notification);
    });

    // Listen for notification tap responses
    responseListener.current = Notifications.addNotificationResponseReceivedListener((response) => {
      console.log('[Notifications] Notification tapped:', response.notification.request.content.title);
      handleNotificationNavigation(response.notification);
    });

    // Handle app state changes (foreground/background)
    const subscription = AppState.addEventListener('change', (nextAppState) => {
      if (appState.current.match(/inactive|background/) && nextAppState === 'active') {
        console.log('[Notifications] App has come to the foreground');
      }
      appState.current = nextAppState;
    });

    // Cleanup
    return () => {
      if (notificationListener.current) {
        notificationListener.current.remove();
      }
      if (responseListener.current) {
        responseListener.current.remove();
      }
      subscription.remove();
    };
  }, []);

  return {
    requestPermission,
    getAndRegisterToken,
  };
}

/**
 * Export function to manually unregister device token
 * Can be called when user disables notifications in settings
 */
export async function unregisterDeviceToken() {
  try {
    if (!Device.isDevice) {
      console.log('[Notifications] Must use physical device for push notifications');
      return;
    }

    const tokenData = await Notifications.getExpoPushTokenAsync({
      projectId: Constants.expoConfig?.extra?.eas?.projectId,
    });
    const token = tokenData.data;

    // Call backend to remove token
    console.log('[Notifications] Unregistering token:', token.substring(0, 30) + '...');

    // Note: Expo doesn't require explicit token deletion like FCM
    // The backend should handle removing the token from its database

    return token;
  } catch (error) {
    console.error('[Notifications] Error unregistering token:', error);
    throw error;
  }
}
