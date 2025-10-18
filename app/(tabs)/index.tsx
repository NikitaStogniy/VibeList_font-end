import { Image } from "expo-image";
import {
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  View,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useState } from "react";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import {
  useGetFeedQuery,
  useReserveItemMutation,
  useUnreserveItemMutation,
} from "@/store/api";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { Colors } from "@/constants/theme";
import { useTranslation } from "@/hooks/use-translation";
import { useSelector } from "react-redux";
import { RootState } from "@/store";

export default function HomeScreen() {
  const { t } = useTranslation();
  const colorScheme = useColorScheme();
  const currentUser = useSelector((state: RootState) => state.auth.user);
  const [reservingItemId, setReservingItemId] = useState<string | null>(null);

  const { data, isLoading, isError, error, refetch } = useGetFeedQuery({
    limit: 20,
  });
  const [reserveItem] = useReserveItemMutation();
  const [unreserveItem] = useUnreserveItemMutation();

  const handleReserveToggle = async (itemId: string, isReserved: boolean) => {
    console.log("[HomeScreen] Reserve toggle clicked:", { itemId, isReserved });

    setReservingItemId(itemId);

    try {
      if (isReserved) {
        console.log("[HomeScreen] Calling unreserveItem API...");
        await unreserveItem(itemId).unwrap();
        console.log("[HomeScreen] Unreserve successful");
      } else {
        console.log("[HomeScreen] Calling reserveItem API...");
        await reserveItem(itemId).unwrap();
        console.log("[HomeScreen] Reserve successful");
      }
    } catch (err: any) {
      console.error("[HomeScreen] Failed to toggle reservation:", err);
      const errorMessage =
        err?.data?.message || err?.message || "Failed to toggle reservation";
    } finally {
      setReservingItemId(null);
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
          <ThemedText style={styles.loadingText}>
            {t("home.loadingFeed")}
          </ThemedText>
        </ThemedView>
      </SafeAreaView>
    );
  }

  if (isError) {
    return (
      <SafeAreaView style={styles.container} edges={["top", "left", "right"]}>
        <ThemedView style={styles.centerContainer}>
          <ThemedText style={styles.errorText}>
            {t("home.errorLoadingFeed")}
          </ThemedText>
          <ThemedText>{error?.toString()}</ThemedText>
          <TouchableOpacity
            style={[
              styles.button,
              { backgroundColor: Colors[colorScheme ?? "light"].tint },
            ]}
            onPress={() => refetch()}
          >
            <ThemedText style={styles.buttonText}>
              {t("common.retry")}
            </ThemedText>
          </TouchableOpacity>
        </ThemedView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={["top", "left", "right"]}>
      <ThemedView style={styles.header}>
        <ThemedText type="title">{t("home.title")}</ThemedText>
        <ThemedText style={styles.subtitle}>
          {t("home.itemsCount", { count: data?.total || 0 })}
        </ThemedText>
      </ThemedView>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
      >
        {data?.items.map((feedItem) => {
          // Check if this item belongs to the current user
          const isOwnItem = currentUser?.id === feedItem.user.id;
          const isReserving = reservingItemId === feedItem.wishlistItem.id;
          // Check if item is reserved by current user
          const isReservedByCurrentUser = feedItem.wishlistItem.isReserved &&
            feedItem.wishlistItem.reservedBy === currentUser?.id;
          // Check if item is reserved by someone else
          const isReservedByOther = feedItem.wishlistItem.isReserved &&
            feedItem.wishlistItem.reservedBy !== currentUser?.id;

          return (
            <ThemedView key={feedItem.wishlistItem.id} style={styles.card}>
              {feedItem.wishlistItem.imageUrl && (
                <Image
                  source={{ uri: feedItem.wishlistItem.imageUrl }}
                  style={styles.itemImage}
                  contentFit="cover"
                />
              )}

              <View style={styles.cardContent}>
                <ThemedText type="subtitle" style={styles.itemName}>
                  {feedItem.wishlistItem.name}
                </ThemedText>

                {feedItem.wishlistItem.description && (
                  <ThemedText style={styles.description}>
                    {feedItem.wishlistItem.description}
                  </ThemedText>
                )}

                {feedItem.wishlistItem.price && (
                  <ThemedText type="defaultSemiBold" style={styles.price}>
                    {feedItem.wishlistItem.currency || "USD"} $
                    {Number(feedItem.wishlistItem.price).toFixed(2)}
                  </ThemedText>
                )}

                <View style={styles.userInfo}>
                  {feedItem.user.avatarUrl && (
                    <Image
                      source={{ uri: feedItem.user.avatarUrl }}
                      style={styles.avatar}
                      contentFit="cover"
                    />
                  )}
                  <ThemedText style={styles.username}>
                    @{feedItem.user.username}
                  </ThemedText>
                </View>

                {isOwnItem ? (
                  <ThemedView style={styles.ownItemBadge}>
                    <ThemedText style={styles.ownItemText}>
                      It's your item
                    </ThemedText>
                  </ThemedView>
                ) : isReservedByOther ? (
                  <ThemedView style={styles.alreadyReservedBadge}>
                    <ThemedText style={styles.alreadyReservedText}>
                      {t("home.alreadyReserved")}
                    </ThemedText>
                  </ThemedView>
                ) : (
                  <TouchableOpacity
                    style={[
                      styles.reserveButton,
                      {
                        backgroundColor: isReservedByCurrentUser
                          ? Colors[colorScheme ?? "light"].tabIconDefault
                          : Colors[colorScheme ?? "light"].tint,
                      },
                    ]}
                    onPress={() =>
                      handleReserveToggle(
                        feedItem.wishlistItem.id,
                        isReservedByCurrentUser
                      )
                    }
                    disabled={isReserving}
                  >
                    {isReserving ? (
                      <ActivityIndicator size="small" color="white" />
                    ) : (
                      <ThemedText style={styles.reserveButtonText}>
                        {isReservedByCurrentUser
                          ? t("home.unreserve")
                          : t("home.reserve")}
                      </ThemedText>
                    )}
                  </TouchableOpacity>
                )}
              </View>
            </ThemedView>
          );
        })}

        {data?.items.length === 0 && (
          <ThemedView style={styles.emptyState}>
            <ThemedText type="subtitle">{t("home.emptyStateTitle")}</ThemedText>
            <ThemedText style={styles.emptyText}>
              {t("home.emptyStateMessage")}
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
    padding: 20,
    gap: 16,
  },
  header: {
    padding: 20,
    paddingBottom: 16,
  },
  subtitle: {
    opacity: 0.7,
    marginTop: 4,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    gap: 16,
  },
  card: {
    borderRadius: 12,
    overflow: "hidden",
    marginBottom: 8,
  },
  itemImage: {
    width: "100%",
    height: 200,
  },
  cardContent: {
    padding: 16,
    gap: 8,
  },
  itemName: {
    marginBottom: 4,
  },
  description: {
    opacity: 0.8,
  },
  price: {
    fontSize: 18,
    marginTop: 4,
  },
  userInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 8,
  },
  avatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
  },
  username: {
    fontSize: 14,
    opacity: 0.7,
  },
  reserveButton: {
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 12,
  },
  reserveButtonText: {
    color: "white",
    fontWeight: "600",
  },
  loadingText: {
    marginTop: 8,
  },
  errorText: {
    color: "red",
    marginBottom: 8,
  },
  button: {
    padding: 12,
    borderRadius: 8,
    marginTop: 16,
    minWidth: 120,
    alignItems: "center",
  },
  buttonText: {
    color: "white",
    fontWeight: "600",
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
  ownItemBadge: {
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 12,
    borderWidth: 1,
    borderColor: "#888",
  },
  ownItemText: {
    fontWeight: "600",
    opacity: 0.7,
  },
  alreadyReservedBadge: {
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 12,
    backgroundColor: "#f0f0f0",
  },
  alreadyReservedText: {
    fontWeight: "600",
    color: "#666",
  },
});
