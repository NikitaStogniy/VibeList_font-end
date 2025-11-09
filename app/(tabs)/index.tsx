import { FlashList } from "@shopify/flash-list";
import * as Haptics from "expo-haptics";
import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  RefreshControl,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { ItemCard } from "@/components/item-card";
import { SkeletonCard } from "@/components/skeleton-card";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useTranslation } from "@/hooks/use-translation";
import { RootState } from "@/store";
import {
  useGetFeedQuery,
  useReserveItemMutation,
  useUnreserveItemMutation,
} from "@/store/api";
import type { FeedItem } from "@/types/api";
import { useSelector } from "react-redux";

export default function HomeScreen() {
  const { t } = useTranslation();
  const colorScheme = useColorScheme();
  const currentUser = useSelector((state: RootState) => state.auth.user);
  const [reservingItemId, setReservingItemId] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const { data, isLoading, isError, error, refetch, isFetching } =
    useGetFeedQuery({
      limit: 20,
    });
  const [reserveItem] = useReserveItemMutation();
  const [unreserveItem] = useUnreserveItemMutation();

  // Pull-to-refresh handler
  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    try {
      await refetch();
    } finally {
      setIsRefreshing(false);
    }
  }, [refetch]);

  const handleReserveToggle = useCallback(
    async (itemId: string, isReserved: boolean) => {
      console.log("[HomeScreen] Reserve toggle clicked:", {
        itemId,
        isReserved,
      });

      // Haptic feedback
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

      setReservingItemId(itemId);

      try {
        if (isReserved) {
          console.log("[HomeScreen] Calling unreserveItem API...");
          await unreserveItem(itemId).unwrap();
          console.log("[HomeScreen] Unreserve successful");
          await Haptics.notificationAsync(
            Haptics.NotificationFeedbackType.Success
          );
        } else {
          console.log("[HomeScreen] Calling reserveItem API...");
          await reserveItem(itemId).unwrap();
          console.log("[HomeScreen] Reserve successful");
          await Haptics.notificationAsync(
            Haptics.NotificationFeedbackType.Success
          );
        }
      } catch (err: unknown) {
        console.error("[HomeScreen] Failed to toggle reservation:", err);
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      } finally {
        setReservingItemId(null);
      }
    },
    [reserveItem, unreserveItem]
  );

  const renderItem = useCallback(
    ({ item }: { item: FeedItem }) => (
      <ItemCard
        item={item}
        variant="vertical"
        currentUserId={currentUser?.id}
        reservingItemId={reservingItemId}
        onReserveToggle={handleReserveToggle}
        showReserveButton={true}
        showUserInfo={true}
        showPriceMonitoring={false}
        showProductLink={false}
        showPriority={false}
      />
    ),
    [currentUser?.id, reservingItemId, handleReserveToggle]
  );

  const keyExtractor = useCallback(
    (item: FeedItem) => item.wishlistItem.id,
    []
  );

  // Define components before conditional returns
  const ListHeaderComponent = useCallback(
    () => (
      <ThemedView style={styles.header}>
        <ThemedText type="title">{t("home.title")}</ThemedText>
        <ThemedText style={styles.subtitle}>
          {t("home.itemsCount", { count: data?.total || 0 })}
        </ThemedText>
      </ThemedView>
    ),
    [t, data?.total]
  );

  const ListEmptyComponent = useCallback(
    () => (
      <ThemedView style={styles.emptyState}>
        <ThemedText type="subtitle">{t("home.emptyStateTitle")}</ThemedText>
        <ThemedText style={styles.emptyText}>
          {t("home.emptyStateMessage")}
        </ThemedText>
      </ThemedView>
    ),
    [t]
  );

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container} edges={["top", "left", "right"]}>
        <ThemedView style={styles.header}>
          <ThemedText type="title">{t("home.title")}</ThemedText>
        </ThemedView>
        <View style={styles.skeletonContainer}>
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </View>
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
      <FlashList
        data={data?.items || []}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        ListHeaderComponent={ListHeaderComponent}
        ListEmptyComponent={ListEmptyComponent}
        contentContainerStyle={styles.flashListContent}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            tintColor={Colors[colorScheme ?? "light"].tint}
            colors={[Colors[colorScheme ?? "light"].tint]}
          />
        }
        ListFooterComponent={
          isFetching && !isRefreshing ? (
            <View style={styles.footerLoader}>
              <ActivityIndicator
                size="small"
                color={Colors[colorScheme ?? "light"].tint}
              />
            </View>
          ) : null
        }
      />
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
  skeletonContainer: {
    flex: 1,
    padding: 16,
  },
  flashListContent: {
    padding: 16,
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
  footerLoader: {
    padding: 20,
    alignItems: "center",
  },
});
