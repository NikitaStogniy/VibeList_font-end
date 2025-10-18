import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import {
  useGetNotificationsQuery,
  useMarkAllNotificationsAsReadMutation,
  useMarkNotificationAsReadMutation,
} from "@/store/api";
import { Image } from "expo-image";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function NotificationsScreen() {
  const colorScheme = useColorScheme();
  const { data, isLoading } = useGetNotificationsQuery({ limit: 50 });
  const [markAsRead] = useMarkNotificationAsReadMutation();
  const [markAllAsRead] = useMarkAllNotificationsAsReadMutation();

  const handleNotificationPress = async (
    notificationId: string,
    isRead: boolean
  ) => {
    if (!isRead) {
      try {
        await markAsRead(notificationId).unwrap();
      } catch (err) {
        console.error("Failed to mark notification as read:", err);
      }
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsRead().unwrap();
    } catch (err) {
      console.error("Failed to mark all as read:", err);
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container} edges={["top", "left", "right"]}>
        <ThemedView style={styles.centerContainer}>
          <ActivityIndicator
            size="large"
            color={Colors[colorScheme ?? "light"].tint}
          />
        </ThemedView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={["top", "left", "right"]}>
      <ThemedView style={styles.header}>
        <ThemedText type="title">Notifications</ThemedText>
        {data && data.unreadCount > 0 && (
          <TouchableOpacity onPress={handleMarkAllAsRead}>
            <ThemedText
              style={[
                styles.markAllButton,
                { color: Colors[colorScheme ?? "light"].tint },
              ]}
            >
              Mark all as read
            </ThemedText>
          </TouchableOpacity>
        )}
      </ThemedView>

      <ScrollView style={styles.scrollView}>
        {data?.notifications.map((notification) => (
          <TouchableOpacity
            key={notification.id}
            onPress={() =>
              handleNotificationPress(notification.id, notification.isRead)
            }
          >
            <ThemedView
              style={[
                styles.notificationCard,
                !notification.isRead && styles.unreadCard,
              ]}
            >
              <View style={styles.notificationContent}>
                {notification.actorAvatarUrl && (
                  <Image
                    source={{ uri: notification.actorAvatarUrl }}
                    style={styles.avatar}
                    contentFit="cover"
                  />
                )}
                <View style={styles.textContent}>
                  <ThemedText style={styles.message}>
                    {notification.message}
                  </ThemedText>
                  <ThemedText style={styles.timestamp}>
                    {new Date(notification.createdAt).toLocaleDateString()} at{" "}
                    {new Date(notification.createdAt).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </ThemedText>
                </View>
                {!notification.isRead && (
                  <View
                    style={[
                      styles.unreadDot,
                      { backgroundColor: Colors[colorScheme ?? "light"].tint },
                    ]}
                  />
                )}
              </View>
            </ThemedView>
          </TouchableOpacity>
        ))}

        {data?.notifications.length === 0 && (
          <ThemedView style={styles.emptyState}>
            <ThemedText type="subtitle">No notifications yet</ThemedText>
            <ThemedText style={styles.emptyText}>
              You&apos;ll see updates about your activity here
            </ThemedText>
          </ThemedView>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    padding: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  markAllButton: {
    fontSize: 14,
    fontWeight: "600",
  },
  scrollView: {
    flex: 1,
  },
  notificationCard: {
    padding: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#ccc",
  },
  unreadCard: {
    backgroundColor: "rgba(0, 122, 255, 0.05)",
  },
  notificationContent: {
    flexDirection: "row",
    gap: 12,
    alignItems: "flex-start",
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  textContent: {
    flex: 1,
    gap: 4,
  },
  message: {
    fontSize: 15,
  },
  timestamp: {
    fontSize: 12,
    opacity: 0.6,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginTop: 8,
  },
  emptyState: {
    padding: 40,
    alignItems: "center",
    gap: 8,
  },
  emptyText: {
    textAlign: "center",
    opacity: 0.7,
  },
});
