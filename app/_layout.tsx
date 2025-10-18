import "@/i18n";
import { ThemeProvider } from "@react-navigation/native";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import "react-native-reanimated";
import { Provider } from "react-redux";
import { GestureHandlerRootView } from "react-native-gesture-handler";

import { DarkTheme, LightTheme } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { store } from "@/store";
import { useAuthRestore } from "@/hooks/useAuthRestore";

function RootLayoutContent() {
  const colorScheme = useColorScheme();

  // Restore auth state from secure storage on app start
  useAuthRestore();

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
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Provider store={store}>
        <RootLayoutContent />
      </Provider>
    </GestureHandlerRootView>
  );
}
