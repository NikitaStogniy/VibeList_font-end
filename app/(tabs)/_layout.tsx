import * as Haptics from "expo-haptics";
import { Tabs, Redirect } from "expo-router";
import React from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";

import { AddItemBottomSheet } from "@/components/add-item-bottom-sheet";
import { HapticTab } from "@/components/haptic-tab";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { Colors } from "@/constants/theme";
import {
  BottomSheetProvider,
  useBottomSheet,
} from "@/contexts/bottom-sheet-context";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useTranslation } from "@/hooks/use-translation";
import { useAppSelector } from "@/store";

function TabsContent() {
  const { t } = useTranslation();
  const colorScheme = useColorScheme();
  const { toggleAddItemSheet } = useBottomSheet();
  const { isAuthenticated } = useAppSelector((state) => state.auth);

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Redirect href="/auth/login" />;
  }

  return (
    <>
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: Colors[colorScheme ?? "light"].tint,
          headerShown: false,
          tabBarButton: HapticTab,
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: t("tabs.home"),
            tabBarIcon: ({ color }) => (
              <IconSymbol size={28} name="house.fill" color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="explore"
          options={{
            title: t("tabs.search"),
            tabBarIcon: ({ color }) => (
              <IconSymbol size={28} name="magnifyingglass" color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="add-item"
          options={{
            title: t("tabs.addItem"),
            tabBarButton: (props) => (
              <Pressable
                onPress={(e) => {
                  if (process.env.EXPO_OS === "ios") {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                  }
                  toggleAddItemSheet();
                }}
                style={[props.style, styles.addButtonContainer]}
                accessibilityRole={props.accessibilityRole}
                accessibilityState={props.accessibilityState}
                accessibilityLabel={props.accessibilityLabel}
                testID={props.testID}
              >
                <View
                  style={[
                    styles.addButton,
                    { backgroundColor: Colors[colorScheme ?? "light"].tint },
                  ]}
                >
                  <IconSymbol size={32} name="plus" color="#fff" />
                </View>
              </Pressable>
            ),
          }}
          listeners={{
            tabPress: (e) => {
              e.preventDefault();
            },
          }}
        />
        <Tabs.Screen
          name="notifications"
          options={{
            title: t("tabs.notifications"),
            tabBarIcon: ({ color }) => (
              <IconSymbol size={28} name="bell.fill" color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            title: t("tabs.profile"),
            tabBarIcon: ({ color }) => (
              <IconSymbol size={28} name="person.circle.fill" color={color} />
            ),
          }}
        />
      </Tabs>
      <AddItemBottomSheet />
    </>
  );
}

export default function TabLayout() {
  return (
    <BottomSheetModalProvider>
      <BottomSheetProvider>
        <TabsContent />
      </BottomSheetProvider>
    </BottomSheetModalProvider>
  );
}

const styles = StyleSheet.create({
  addButtonContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  addButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
  },
});
