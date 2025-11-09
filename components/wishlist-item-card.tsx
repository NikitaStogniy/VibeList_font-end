import { ItemCard } from "@/components/item-card";
import type { FeedItem, WishlistItem } from "@/types/api";
import React from "react";

export type WishlistItemCardProps = {
  item: WishlistItem | FeedItem;
  onPress?: (item: WishlistItem) => void;
};

/**
 * WishlistItemCard - A wrapper component around ItemCard for backward compatibility
 * Uses horizontal layout variant with all metadata features enabled
 */
export const WishlistItemCard = ({
  item,
  onPress,
}: WishlistItemCardProps) => {
  return (
    <ItemCard
      item={item}
      variant="horizontal"
      onPress={onPress}
      showPriceMonitoring={true}
      showProductLink={true}
      showPriority={true}
      showReserveButton={false}
    />
  );
};
