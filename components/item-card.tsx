import * as Haptics from "expo-haptics";
import { Image } from "expo-image";
import { memo } from "react";
import {
  ActivityIndicator,
  Linking,
  Pressable,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useTranslation } from "@/hooks/use-translation";
import type { FeedItem, WishlistItem } from "@/types/api";

export interface ItemCardProps {
  item: WishlistItem | FeedItem;

  // Layout options
  variant?: "vertical" | "horizontal";

  // User context
  currentUserId?: string;
  showUserInfo?: boolean;

  // Interaction handlers
  onPress?: (item: WishlistItem) => void;
  onReserveToggle?: (itemId: string, isReserved: boolean) => void;

  // UI state
  reservingItemId?: string | null;
  showReserveButton?: boolean;

  // Feature flags
  showPriceMonitoring?: boolean;
  showProductLink?: boolean;
  showPriority?: boolean;
}

const ItemCardComponent = ({
  item,
  variant = "vertical",
  currentUserId,
  showUserInfo,
  onPress,
  onReserveToggle,
  reservingItemId,
  showReserveButton = false,
  showPriceMonitoring = true,
  showProductLink = true,
  showPriority = true,
}: ItemCardProps) => {
  const { t } = useTranslation();
  const colorScheme = useColorScheme();
  const borderColor = Colors[colorScheme ?? "light"].border;
  const cardBgColor = Colors[colorScheme ?? "light"].card;
  const iconColor = Colors[colorScheme ?? "light"].icon;
  const tintColor = Colors[colorScheme ?? "light"].tint;
  const linkColor = Colors[colorScheme ?? "light"].link;
  const successColor = Colors[colorScheme ?? "light"].success;
  const warningColor = Colors[colorScheme ?? "light"].warning;
  const reservedColor = Colors[colorScheme ?? "light"].reserved;
  const badgeColor = Colors[colorScheme ?? "light"].badge;
  const badgeTextColor = Colors[colorScheme ?? "light"].badgeText;
  const ownItemBorderColor = Colors[colorScheme ?? "light"].ownItemBorder;

  // Handle both WishlistItem and FeedItem types
  const wishlistItem = "wishlistItem" in item ? item.wishlistItem : item;
  const user = "user" in item ? item.user : undefined;

  // Determine if user info should be shown
  const shouldShowUserInfo = showUserInfo ?? user !== undefined;

  // Calculate item states
  const isOwnItem = currentUserId === wishlistItem.userId;
  const isReserving = reservingItemId === wishlistItem.id;
  const isReservedByCurrentUser =
    wishlistItem.isReserved && wishlistItem.reservedBy === currentUserId;
  const isReservedByOther =
    wishlistItem.isReserved && wishlistItem.reservedBy !== currentUserId;

  const handlePress = async () => {
    if (onPress) {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      onPress(wishlistItem);
    }
  };

  const handleReserveToggle = async () => {
    if (onReserveToggle) {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      onReserveToggle(wishlistItem.id, isReservedByCurrentUser);
    }
  };

  const handleLinkPress = async () => {
    if (wishlistItem.productUrl) {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      Linking.openURL(wishlistItem.productUrl);
    }
  };

  const renderImage = () => {
    const imageStyle =
      variant === "vertical" ? styles.verticalImage : styles.horizontalImage;
    const placeholderStyle =
      variant === "vertical"
        ? styles.verticalImagePlaceholder
        : styles.horizontalImagePlaceholder;

    if (wishlistItem.imageUrl) {
      return (
        <Image
          source={{ uri: wishlistItem.imageUrl }}
          style={imageStyle}
          contentFit="cover"
        />
      );
    }

    return (
      <View style={[placeholderStyle, { backgroundColor: iconColor + "20" }]}>
        <ThemedText style={styles.imagePlaceholderText}>📦</ThemedText>
      </View>
    );
  };

  const renderUserInfo = () => {
    if (!shouldShowUserInfo || !user) return null;

    return (
      <View style={styles.userInfo}>
        {user.avatarUrl && (
          <Image
            source={{ uri: user.avatarUrl }}
            style={styles.avatar}
            contentFit="cover"
          />
        )}
        <ThemedText style={styles.username}>@{user.username}</ThemedText>
      </View>
    );
  };

  const renderReservationControl = () => {
    if (isOwnItem) {
      return (
        <ThemedView style={[styles.ownItemBadge, { borderColor: ownItemBorderColor }]}>
          <ThemedText style={styles.ownItemText}>
            {t("home.ownItem")}
          </ThemedText>
        </ThemedView>
      );
    }

    if (isReservedByOther && !showReserveButton) {
      return (
        <View style={[styles.reservedBadge, { backgroundColor: reservedColor }]}>
          <ThemedText style={styles.reservedText}>
            {t("home.alreadyReserved")}
          </ThemedText>
        </View>
      );
    }

    if (isReservedByOther && showReserveButton) {
      return (
        <ThemedView style={[styles.alreadyReservedBadge, { backgroundColor: badgeColor }]}>
          <ThemedText style={[styles.alreadyReservedText, { color: badgeTextColor }]}>
            {t("home.alreadyReserved")}
          </ThemedText>
        </ThemedView>
      );
    }

    if (showReserveButton && onReserveToggle) {
      return (
        <TouchableOpacity
          style={[
            styles.reserveButton,
            {
              backgroundColor: isReservedByCurrentUser
                ? Colors[colorScheme ?? "light"].tabIconDefault
                : tintColor,
            },
          ]}
          onPress={handleReserveToggle}
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
      );
    }

    if (wishlistItem.isReserved) {
      return (
        <View style={[styles.reservedBadge, { backgroundColor: reservedColor }]}>
          <ThemedText style={styles.reservedText}>Reserved</ThemedText>
        </View>
      );
    }

    return null;
  };

  const renderFooter = () => {
    const showFooter =
      wishlistItem.price != null ||
      (showPriceMonitoring && wishlistItem.parsingEnabled) ||
      (showProductLink && wishlistItem.productUrl) ||
      wishlistItem.isReserved;

    if (!showFooter) return null;

    return (
      <View style={styles.footer}>
        {/* Price */}
        {wishlistItem.price != null && (
          <View style={styles.priceContainer}>
            <ThemedText type="defaultSemiBold" style={styles.price}>
              {wishlistItem.currency || "USD"} $
              {Number(wishlistItem.price).toFixed(2)}
            </ThemedText>
            {/* Price Monitoring Badge */}
            {showPriceMonitoring && wishlistItem.parsingEnabled && (
              <View style={[styles.monitoringBadge, { backgroundColor: successColor }]}>
                <ThemedText style={styles.monitoringText}>📊</ThemedText>
              </View>
            )}
          </View>
        )}

        {/* Warning if URL exists but no price */}
        {wishlistItem.productUrl && !wishlistItem.price && (
          <View style={[styles.warningBadge, { backgroundColor: warningColor }]}>
            <ThemedText style={styles.warningText}>⚠️ No price</ThemedText>
          </View>
        )}

        {/* Product Link */}
        {showProductLink && wishlistItem.productUrl && (
          <Pressable onPress={handleLinkPress} style={styles.linkButton}>
            <ThemedText style={[styles.linkText, { color: linkColor }]}>🔗 View</ThemedText>
          </Pressable>
        )}
      </View>
    );
  };

  const renderContent = () => (
    <View
      style={
        variant === "vertical"
          ? styles.verticalContent
          : styles.horizontalContent
      }
    >
      {renderUserInfo()}

      <ThemedText
        type="subtitle"
        style={styles.itemName}
        numberOfLines={variant === "horizontal" ? 2 : undefined}
      >
        {wishlistItem.name}
      </ThemedText>

      {wishlistItem.description && (
        <ThemedText
          style={styles.description}
          numberOfLines={variant === "horizontal" ? 2 : undefined}
        >
          {wishlistItem.description}
        </ThemedText>
      )}

      {renderFooter()}

      {/* Priority Indicator */}
      {showPriority && wishlistItem.priority && (
        <View style={styles.priorityContainer}>
          <ThemedText style={[styles.priorityText, { color: iconColor }]}>
            Priority: {wishlistItem.priority}
          </ThemedText>
        </View>
      )}

      {renderReservationControl()}
    </View>
  );

  const cardStyle =
    variant === "vertical"
      ? [styles.verticalCard]
      : [styles.horizontalCard, { borderColor, backgroundColor: cardBgColor }];

  const CardWrapper = onPress ? Pressable : View;

  return (
    <CardWrapper onPress={onPress ? handlePress : undefined}>
      <ThemedView style={cardStyle}>
        {renderImage()}
        {renderContent()}
      </ThemedView>
    </CardWrapper>
  );
};

// Memoize with custom comparison function
export const ItemCard = memo(ItemCardComponent, (prevProps, nextProps) => {
  // Extract wishlist items
  const prevItem =
    "wishlistItem" in prevProps.item
      ? prevProps.item.wishlistItem
      : prevProps.item;
  const nextItem =
    "wishlistItem" in nextProps.item
      ? nextProps.item.wishlistItem
      : nextProps.item;

  // Check if critical properties changed
  if (prevItem.id !== nextItem.id) return false;
  if (prevItem.isReserved !== nextItem.isReserved) return false;
  if (prevItem.reservedBy !== nextItem.reservedBy) return false;
  if (prevItem.name !== nextItem.name) return false;
  if (prevItem.description !== nextItem.description) return false;
  if (prevItem.price !== nextItem.price) return false;
  if (prevItem.imageUrl !== nextItem.imageUrl) return false;
  if (prevItem.parsingEnabled !== nextItem.parsingEnabled) return false;
  if (prevItem.productUrl !== nextItem.productUrl) return false;
  if (prevItem.priority !== nextItem.priority) return false;

  // Check props
  if (prevProps.variant !== nextProps.variant) return false;
  if (prevProps.currentUserId !== nextProps.currentUserId) return false;
  if (prevProps.reservingItemId !== nextProps.reservingItemId) return false;
  if (prevProps.showReserveButton !== nextProps.showReserveButton) return false;
  if (prevProps.onPress !== nextProps.onPress) return false;
  if (prevProps.onReserveToggle !== nextProps.onReserveToggle) return false;

  // Props are equal, skip re-render
  return true;
});

ItemCard.displayName = "ItemCard";

const styles = StyleSheet.create({
  // Vertical variant (Feed style)
  verticalCard: {
    borderRadius: 12,
    overflow: "hidden",
    marginBottom: 8,
  },
  verticalImage: {
    width: "100%",
    height: 200,
  },
  verticalImagePlaceholder: {
    width: "100%",
    height: 200,
    justifyContent: "center",
    alignItems: "center",
  },
  verticalContent: {
    padding: 16,
    gap: 8,
  },

  // Horizontal variant (Wishlist style)
  horizontalCard: {
    flexDirection: "row",
    borderRadius: 12,
    borderWidth: 1,
    overflow: "hidden",
    marginBottom: 12,
    marginHorizontal: 16,
  },
  horizontalImage: {
    width: 120,
    height: 120,
  },
  horizontalImagePlaceholder: {
    width: 120,
    height: 120,
    justifyContent: "center",
    alignItems: "center",
  },
  horizontalContent: {
    flex: 1,
    padding: 12,
    justifyContent: "space-between",
  },

  // Common styles
  imagePlaceholderText: {
    fontSize: 48,
  },
  userInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 8,
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
  itemName: {
    marginBottom: 4,
  },
  description: {
    opacity: 0.8,
  },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 4,
  },
  priceContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  price: {
    fontSize: 18,
  },
  monitoringBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  monitoringText: {
    fontSize: 10,
  },
  warningBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  warningText: {
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "600",
  },
  reservedBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    alignSelf: "flex-start",
  },
  reservedText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "600",
  },
  linkButton: {
    marginLeft: "auto",
  },
  linkText: {
    fontSize: 14,
  },
  priorityContainer: {
    marginTop: 4,
  },
  priorityText: {
    fontSize: 12,
    textTransform: "capitalize",
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
  ownItemBadge: {
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 12,
    borderWidth: 1,
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
  },
  alreadyReservedText: {
    fontWeight: "600",
  },
});
