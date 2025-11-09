import "@/i18n";
import { ThemeProvider } from "@react-navigation/native";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import "react-native-reanimated";
import { Provider } from "react-redux";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import * as Sentry from '@sentry/react-native';

import { Colors, DarkTheme, LightTheme } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { store, persistor } from "@/store";
import { useAuthRestore } from "@/hooks/useAuthRestore";
import { ErrorBoundary } from "@/components/error-boundary";
import { PersistGate } from 'redux-persist/integration/react';
import { ActivityIndicator, View, StyleSheet, useColorScheme as useDeviceColorScheme } from 'react-native';
import { ThemeTransitionProvider } from '@/contexts/theme-transition-context';
import { usePushNotifications } from '@/hooks/use-push-notifications';

// Initialize Sentry
// TODO: Replace with your Sentry DSN in production
const SENTRY_DSN = process.env.EXPO_PUBLIC_SENTRY_DSN || '';

if (SENTRY_DSN && !__DEV__) {
  Sentry.init({
    dsn: SENTRY_DSN,
    // Performance monitoring
    tracesSampleRate: 1.0,
    enableAutoPerformanceTracing: true,
    enableAppStartTracking: true,
    enableNativeFramesTracking: true,
    enableStallTracking: true,
    // Session replay (adjust sample rates for production)
    replaysSessionSampleRate: 0.1,
    replaysOnErrorSampleRate: 1.0,
    // Native crash handling
    enableNative: true,
    enableNativeCrashHandling: true,
    // Environment
    environment: __DEV__ ? 'development' : 'production',
    // Attach debug info
    attachScreenshot: true,
    attachViewHierarchy: false,
    attachStacktrace: true,
    // Filter sensitive data
    beforeSend: (event) => {
      // Remove sensitive user data if needed
      if (event.user) {
        delete event.user.email;
      }
      return event;
    },
  });
}

function RootLayoutContent() {
  const colorScheme = useColorScheme();

  // Restore auth state from secure storage on app start
  useAuthRestore();

  // Initialize push notifications
  usePushNotifications();

  return (
    <ThemeProvider value={colorScheme === "dark" ? DarkTheme : LightTheme}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="auth" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen
          name="settings"
          options={{ presentation: "modal", title: "Settings", headerShown: true }}
        />
      </Stack>
      <StatusBar style={colorScheme === "dark" ? "light" : "dark"} />
    </ThemeProvider>
  );
}

function LoadingView() {
  const deviceColorScheme = useDeviceColorScheme();
  const backgroundColor = Colors[deviceColorScheme ?? 'light'].background;
  const tintColor = Colors[deviceColorScheme ?? 'light'].tint;

  return (
    <View style={[styles.loadingContainer, { backgroundColor }]}>
      <ActivityIndicator size="large" color={tintColor} />
    </View>
  );
}

function RootLayoutWithErrorBoundary() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Provider store={store}>
        <PersistGate
          loading={<LoadingView />}
          persistor={persistor}
        >
          <ThemeTransitionProvider>
            <ErrorBoundary>
              <RootLayoutContent />
            </ErrorBoundary>
          </ThemeTransitionProvider>
        </PersistGate>
      </Provider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

// Wrap with Sentry for performance tracking
export default Sentry.wrap(RootLayoutWithErrorBoundary);
