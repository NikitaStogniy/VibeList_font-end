import { useTranslation } from "@/hooks/use-translation";
import React from "react";
import { StyleSheet, Text, View, Pressable } from "react-native";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";

interface MenuViewProps {
  onSelectPasteLink: () => void;
  onSelectManualEntry: () => void;
}

export function MenuView({
  onSelectPasteLink,
  onSelectManualEntry,
}: MenuViewProps) {
  const { t } = useTranslation();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];

  return (
    <View style={styles.container}>
      <Text style={[styles.header, { color: colors.text }]}>{t("addItem.title")}</Text>

      <Pressable
        style={({ pressed }) => [
          styles.button,
          {
            backgroundColor: colors.tint,
            opacity: pressed ? 0.7 : 1,
          },
        ]}
        onPress={onSelectPasteLink}
      >
        <Text style={styles.buttonText}>{t("addItem.pasteLink")}</Text>
      </Pressable>

      <Pressable
        style={({ pressed }) => [
          styles.button,
          {
            backgroundColor: colors.tint,
            opacity: pressed ? 0.7 : 1,
          },
        ]}
        onPress={onSelectManualEntry}
      >
        <Text style={styles.buttonText}>{t("addItem.manualEntry")}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 16,
  },
  header: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 8,
  },
  button: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});
