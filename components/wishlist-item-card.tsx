import React, { memo } from 'react';
import { StyleSheet, View, Image, Pressable, Linking } from 'react-native';
import { ThemedView } from '@/components/themed-view';
import { ThemedText } from '@/components/themed-text';
import { useThemeColor } from '@/hooks/use-theme-color';
import type { WishlistItem, FeedItem } from '@/types/api';

export type WishlistItemCardProps = {
  item: WishlistItem | FeedItem;
  onPress?: (item: WishlistItem) => void;
};

const WishlistItemCardComponent = ({ item, onPress }: WishlistItemCardProps) => {
  // Handle both WishlistItem and FeedItem types
  const wishlistItem = 'wishlistItem' in item ? item.wishlistItem : item;
  const user = 'user' in item ? item.user : undefined;

  const borderColor = useThemeColor({}, 'border');
  const cardBgColor = useThemeColor({}, 'card');
  const iconColor = useThemeColor({}, 'icon');

  const handlePress = () => {
    if (onPress) {
      onPress(wishlistItem);
    }
  };

  const handleLinkPress = () => {
    if (wishlistItem.productUrl) {
      Linking.openURL(wishlistItem.productUrl);
    }
  };

  return (
    <Pressable onPress={handlePress}>
      <ThemedView
        style={[
          styles.card,
          {
            borderColor,
            backgroundColor: cardBgColor,
          }
        ]}
      >
        {/* Item Image */}
        {wishlistItem.imageUrl ? (
          <Image
            source={{ uri: wishlistItem.imageUrl }}
            style={styles.image}
            resizeMode="cover"
          />
        ) : (
          <View style={[styles.imagePlaceholder, { backgroundColor: iconColor + '20' }]}>
            <ThemedText style={styles.imagePlaceholderText}>📦</ThemedText>
          </View>
        )}

        {/* Item Details */}
        <View style={styles.content}>
          {/* User Info (if FeedItem) */}
          {user && (
            <View style={styles.userInfo}>
              <ThemedText type="defaultSemiBold" style={styles.userName}>
                {user.displayName}
              </ThemedText>
              <ThemedText style={[styles.username, { color: iconColor }]}>
                @{user.username}
              </ThemedText>
            </View>
          )}

          {/* Item Name */}
          <ThemedText type="defaultSemiBold" numberOfLines={2} style={styles.itemName}>
            {wishlistItem.name}
          </ThemedText>

          {/* Description */}
          {wishlistItem.description && (
            <ThemedText
              numberOfLines={2}
              style={[styles.description, { color: iconColor }]}
            >
              {wishlistItem.description}
            </ThemedText>
          )}

          {/* Price & Reservation Status Row */}
          <View style={styles.footer}>
            {/* Price */}
            {wishlistItem.price != null && (
              <ThemedText type="defaultSemiBold" style={styles.price}>
                {wishlistItem.currency || '$'}{Number(wishlistItem.price).toFixed(2)}
              </ThemedText>
            )}

            {/* Reservation Badge */}
            {wishlistItem.isReserved && (
              <View style={styles.reservedBadge}>
                <ThemedText style={styles.reservedText}>Reserved</ThemedText>
              </View>
            )}

            {/* Product Link */}
            {wishlistItem.productUrl && (
              <Pressable onPress={handleLinkPress} style={styles.linkButton}>
                <ThemedText style={styles.linkText}>🔗 View</ThemedText>
              </Pressable>
            )}
          </View>

          {/* Priority Indicator */}
          {wishlistItem.priority && (
            <View style={styles.priorityContainer}>
              <ThemedText style={[styles.priorityText, { color: iconColor }]}>
                Priority: {wishlistItem.priority}
              </ThemedText>
            </View>
          )}
        </View>
      </ThemedView>
    </Pressable>
  );
};

// Memoize with custom comparison function to ensure updates on isReserved change
export const WishlistItemCard = memo(WishlistItemCardComponent, (prevProps, nextProps) => {
  // Return true if props are equal (skip re-render), false if different (re-render)
  const prevItem = 'wishlistItem' in prevProps.item ? prevProps.item.wishlistItem : prevProps.item;
  const nextItem = 'wishlistItem' in nextProps.item ? nextProps.item.wishlistItem : nextProps.item;

  // Check if critical properties changed
  if (prevItem.id !== nextItem.id) return false;
  if (prevItem.isReserved !== nextItem.isReserved) return false;
  if (prevItem.name !== nextItem.name) return false;
  if (prevItem.description !== nextItem.description) return false;
  if (prevItem.price !== nextItem.price) return false;
  if (prevItem.imageUrl !== nextItem.imageUrl) return false;

  // Check if onPress function changed
  if (prevProps.onPress !== nextProps.onPress) return false;

  // Props are equal, skip re-render
  return true;
});

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    borderRadius: 12,
    borderWidth: 1,
    overflow: 'hidden',
    marginBottom: 12,
    marginHorizontal: 16,
  },
  image: {
    width: 120,
    height: 120,
  },
  imagePlaceholder: {
    width: 120,
    height: 120,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imagePlaceholderText: {
    fontSize: 48,
  },
  content: {
    flex: 1,
    padding: 12,
    justifyContent: 'space-between',
  },
  userInfo: {
    marginBottom: 4,
  },
  userName: {
    fontSize: 14,
  },
  username: {
    fontSize: 12,
  },
  itemName: {
    fontSize: 16,
    marginBottom: 4,
  },
  description: {
    fontSize: 14,
    marginBottom: 8,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
  },
  price: {
    fontSize: 16,
  },
  reservedBadge: {
    backgroundColor: '#FF6B6B',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  reservedText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  linkButton: {
    marginLeft: 'auto',
  },
  linkText: {
    fontSize: 14,
    color: '#0a7ea4',
  },
  priorityContainer: {
    marginTop: 4,
  },
  priorityText: {
    fontSize: 12,
    textTransform: 'capitalize',
  },
});
