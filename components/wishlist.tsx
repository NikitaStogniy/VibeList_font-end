import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { WishlistItemCard } from "@/components/wishlist-item-card";
import { useThemeColor } from "@/hooks/use-theme-color";
import type { FeedItem, WishlistItem } from "@/types/api";
import { FlashList } from "@shopify/flash-list";
import React, { memo, useCallback } from "react";
import { RefreshControl, StyleSheet } from "react-native";

export type WishListProps = {
  items: (WishlistItem | FeedItem)[];
  onItemPress?: (item: WishlistItem) => void;
  onRefresh?: () => void;
  refreshing?: boolean;
  emptyMessage?: string;
  ListHeaderComponent?: React.ComponentType<any> | React.ReactElement | null;
  ListFooterComponent?: React.ComponentType<any> | React.ReactElement | null;
  onEndReached?: () => void;
  onEndReachedThreshold?: number;
};

const WishListComponent = ({
  items,
  onItemPress,
  onRefresh,
  refreshing = false,
  emptyMessage = "No items yet",
  ListHeaderComponent,
  ListFooterComponent,
  onEndReached,
  onEndReachedThreshold = 0.5,
}: WishListProps) => {
  const tintColor = useThemeColor({}, "tint");

  // Render individual item
  const renderItem = useCallback(
    ({ item }: { item: WishlistItem | FeedItem }) => {
      return <WishlistItemCard item={item} onPress={onItemPress} />;
    },
    [onItemPress]
  );

  // Empty state
  const renderEmptyComponent = useCallback(() => {
    return (
      <ThemedView style={styles.emptyContainer}>
        <ThemedText style={styles.emptyText}>{emptyMessage}</ThemedText>
      </ThemedView>
    );
  }, [emptyMessage]);

  // Extract key for each item
  const keyExtractor = useCallback(
    (item: WishlistItem | FeedItem, index: number) => {
      const id = "wishlistItem" in item ? item.wishlistItem.id : item.id;
      return `${id}-${index}`;
    },
    []
  );

  return (
    <FlashList
      data={items}
      renderItem={renderItem}
      keyExtractor={keyExtractor}
      contentContainerStyle={styles.contentContainer}
      ListEmptyComponent={renderEmptyComponent}
      ListHeaderComponent={ListHeaderComponent}
      ListFooterComponent={ListFooterComponent}
      onEndReached={onEndReached}
      onEndReachedThreshold={onEndReachedThreshold}
      refreshControl={
        onRefresh ? (
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={tintColor}
          />
        ) : undefined
      }
    />
  );
};

// Memoize component to prevent unnecessary re-renders
export const WishList = memo(WishListComponent);

const styles = StyleSheet.create({
  contentContainer: {
    paddingVertical: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    opacity: 0.6,
  },
});
