import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useTranslation } from "@/hooks/use-translation";
import { useAppDispatch, useAppSelector } from "@/store";
import {
  selectSettings,
  setEmailNotifications,
  setPushNotifications,
  setTheme,
} from "@/store/settings-slice";
import { useLogoutMutation } from "@/store/api";
import { router, Redirect } from "expo-router";
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function SettingsScreen() {
  const colorScheme = useColorScheme();
  const { t, currentLanguage, changeLanguage } = useTranslation();
  const dispatch = useAppDispatch();
  const settings = useAppSelector(selectSettings);
  const { isAuthenticated } = useAppSelector((state) => state.auth);
  const [logout, { isLoading: isLoggingOut }] = useLogoutMutation();

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Redirect href="/auth/login" />;
  }

  const languages = [
    { code: "en", name: "English", nativeName: "English" },
    { code: "ru", name: "Russian", nativeName: "Русský" },
  ];

  const themes = [
    { value: "light", label: "settings.theme.light" },
    { value: "dark", label: "settings.theme.dark" },
    { value: "auto", label: "settings.theme.auto" },
  ];

  const handleLanguageChange = (languageCode: string) => {
    changeLanguage(languageCode);
  };

  const handleThemeChange = (theme: "light" | "dark" | "auto") => {
    dispatch(setTheme(theme));
  };

  const handleLogout = () => {
    Alert.alert(
      t("settings.danger.logoutConfirm.title"),
      t("settings.danger.logoutConfirm.message"),
      [
        {
          text: t("settings.danger.logoutConfirm.cancel"),
          style: "cancel",
        },
        {
          text: t("settings.danger.logoutConfirm.confirm"),
          style: "destructive",
          onPress: async () => {
            try {
              await logout().unwrap();
              // Replace navigation stack to prevent going back
              router.replace("/auth/login");
            } catch (error) {
              console.error("Logout error:", error);
              // Even if the API call fails, redirect to login
              router.replace("/auth/login");
            }
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={["top", "left", "right"]}>
      <ScrollView style={styles.scrollView}>
        {/* Language Section */}
        <ThemedView style={styles.section}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>
            {t("settings.language.title")}
          </ThemedText>
          <ThemedView style={styles.optionsContainer}>
            {languages.map((lang) => (
              <TouchableOpacity
                key={lang.code}
                onPress={() => handleLanguageChange(lang.code)}
                style={styles.optionButton}
              >
                <ThemedView
                  style={[
                    styles.option,
                    currentLanguage === lang.code && styles.selectedOption,
                  ]}
                >
                  <View style={styles.optionContent}>
                    <ThemedText
                      type={
                        currentLanguage === lang.code
                          ? "defaultSemiBold"
                          : "default"
                      }
                      style={
                        currentLanguage === lang.code && {
                          color: Colors[colorScheme ?? "light"].tint,
                        }
                      }
                    >
                      {lang.nativeName}
                    </ThemedText>
                    <ThemedText style={styles.optionSubtext}>
                      {lang.name}
                    </ThemedText>
                  </View>
                  {currentLanguage === lang.code && (
                    <ThemedText
                      style={{ color: Colors[colorScheme ?? "light"].tint }}
                    >
                      ✓
                    </ThemedText>
                  )}
                </ThemedView>
              </TouchableOpacity>
            ))}
          </ThemedView>
        </ThemedView>

        {/* Theme Section */}
        <ThemedView style={styles.section}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>
            {t("settings.theme.title")}
          </ThemedText>
          <ThemedView style={styles.optionsContainer}>
            {themes.map((theme) => (
              <TouchableOpacity
                key={theme.value}
                onPress={() =>
                  handleThemeChange(theme.value as "light" | "dark" | "auto")
                }
                style={styles.optionButton}
              >
                <ThemedView
                  style={[
                    styles.option,
                    settings.theme === theme.value && styles.selectedOption,
                  ]}
                >
                  <ThemedText
                    type={
                      settings.theme === theme.value
                        ? "defaultSemiBold"
                        : "default"
                    }
                    style={
                      settings.theme === theme.value && {
                        color: Colors[colorScheme ?? "light"].tint,
                      }
                    }
                  >
                    {t(theme.label)}
                  </ThemedText>
                  {settings.theme === theme.value && (
                    <ThemedText
                      style={{ color: Colors[colorScheme ?? "light"].tint }}
                    >
                      ✓
                    </ThemedText>
                  )}
                </ThemedView>
              </TouchableOpacity>
            ))}
          </ThemedView>
        </ThemedView>

        {/* Notifications Section */}
        <ThemedView style={styles.section}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>
            {t("settings.notifications.title")}
          </ThemedText>
          <ThemedView style={styles.optionsContainer}>
            <ThemedView style={styles.switchOption}>
              <View style={styles.switchOptionContent}>
                <ThemedText type="defaultSemiBold">
                  {t("settings.notifications.push")}
                </ThemedText>
                <ThemedText style={styles.optionSubtext}>
                  {t("settings.notifications.pushDescription")}
                </ThemedText>
              </View>
              <Switch
                value={settings.pushNotifications}
                onValueChange={(value) => {
                  dispatch(setPushNotifications(value));
                }}
                trackColor={{
                  false: Colors[colorScheme ?? "light"].tabIconDefault,
                  true: Colors[colorScheme ?? "light"].tint,
                }}
                thumbColor="#fff"
              />
            </ThemedView>

            <ThemedView style={[styles.switchOption, styles.lastOption]}>
              <View style={styles.switchOptionContent}>
                <ThemedText type="defaultSemiBold">
                  {t("settings.notifications.email")}
                </ThemedText>
                <ThemedText style={styles.optionSubtext}>
                  {t("settings.notifications.emailDescription")}
                </ThemedText>
              </View>
              <Switch
                value={settings.emailNotifications}
                onValueChange={(value) => {
                  dispatch(setEmailNotifications(value));
                }}
                trackColor={{
                  false: Colors[colorScheme ?? "light"].tabIconDefault,
                  true: Colors[colorScheme ?? "light"].tint,
                }}
                thumbColor="#fff"
              />
            </ThemedView>
          </ThemedView>
        </ThemedView>

        {/* App Info Section */}
        <ThemedView style={[styles.section, styles.lastSection]}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>
            {t("settings.about.title")}
          </ThemedText>
          <ThemedView style={styles.infoContainer}>
            <ThemedText style={styles.infoText}>
              {t("settings.about.version")}: 1.0.0
            </ThemedText>
            <ThemedText style={styles.infoText}>VibeList © 2025</ThemedText>
          </ThemedView>
        </ThemedView>

        <ThemedView style={[styles.section, styles.lastSection]}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>
            {t("settings.danger.title")}
          </ThemedText>
          <ThemedView style={styles.optionsContainer}>
            <Pressable
              style={({ pressed }) => [
                styles.logoutButton,
                pressed && styles.logoutButtonPressed,
              ]}
              onPress={handleLogout}
              disabled={isLoggingOut}
            >
              <ThemedText
                type="defaultSemiBold"
                style={styles.logoutButtonText}
              >
                {isLoggingOut
                  ? t("settings.danger.loggingOut")
                  : t("settings.danger.logout")}
              </ThemedText>
            </Pressable>
          </ThemedView>
        </ThemedView>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  section: {
    padding: 20,
    paddingBottom: 12,
  },
  lastSection: {
    paddingBottom: 40,
  },
  sectionTitle: {
    marginBottom: 16,
    fontSize: 20,
  },
  optionsContainer: {
    gap: 1,
    borderRadius: 12,
    overflow: "hidden",
  },
  optionButton: {
    overflow: "hidden",
  },
  option: {
    padding: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  selectedOption: {
    opacity: 1,
  },
  optionContent: {
    flex: 1,
  },
  optionSubtext: {
    fontSize: 12,
    opacity: 0.6,
    marginTop: 2,
  },
  switchOption: {
    padding: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 16,
  },
  lastOption: {
    borderBottomWidth: 0,
  },
  switchOptionContent: {
    flex: 1,
  },
  infoContainer: {
    padding: 16,
    borderRadius: 12,
    gap: 8,
  },
  infoText: {
    fontSize: 14,
    opacity: 0.7,
  },
  logoutButton: {
    padding: 16,
    backgroundColor: "#ff3b30",
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  logoutButtonPressed: {
    opacity: 0.7,
  },
  logoutButtonText: {
    color: "#ffffff",
    fontSize: 16,
  },
});
