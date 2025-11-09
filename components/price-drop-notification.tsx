import React from 'react';
import { StyleSheet, View } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import type { Notification } from '@/types/api';
import { NotificationType } from '@/types/api';
import { useTranslation } from '@/hooks/use-translation';

interface PriceDropNotificationProps {
  notification: Notification;
  isUnread: boolean;
}

export function PriceDropNotification({ notification, isUnread }: PriceDropNotificationProps) {
  const { t } = useTranslation();

  if (notification.type !== NotificationType.PRICE_DROP) {
    return null;
  }

  const { oldPrice, newPrice, currency, discountPercent, itemName } = notification;

  return (
    <ThemedView
      style={[
        styles.container,
        isUnread && styles.unreadContainer,
      ]}
    >
      <View style={styles.iconContainer}>
        <ThemedText style={styles.icon}>💰</ThemedText>
      </View>

      <View style={styles.content}>
        <View style={styles.header}>
          <ThemedText type="defaultSemiBold" style={styles.title}>
            {t('notifications.priceDrop')}
          </ThemedText>
          {discountPercent && (
            <View style={styles.discountBadge}>
              <ThemedText style={styles.discountText}>
                -{Math.round(discountPercent)}%
              </ThemedText>
            </View>
          )}
        </View>

        <ThemedText style={styles.itemName} numberOfLines={1}>
          {itemName || 'Unknown item'}
        </ThemedText>

        {oldPrice !== undefined && newPrice !== undefined && (
          <View style={styles.priceComparison}>
            <View style={styles.oldPriceContainer}>
              <ThemedText style={styles.oldPrice}>
                {currency || '$'}{oldPrice.toFixed(2)}
              </ThemedText>
              <View style={styles.strikethrough} />
            </View>

            <ThemedText style={styles.arrow}>→</ThemedText>

            <ThemedText type="defaultSemiBold" style={styles.newPrice}>
              {currency || '$'}{newPrice.toFixed(2)}
            </ThemedText>
          </View>
        )}

        <ThemedText style={styles.timestamp}>
          {new Date(notification.createdAt).toLocaleDateString()} at{' '}
          {new Date(notification.createdAt).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
          })}
        </ThemedText>
      </View>

      {isUnread && <View style={styles.unreadDot} />}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#ccc',
    flexDirection: 'row',
    gap: 12,
    alignItems: 'flex-start',
  },
  unreadContainer: {
    backgroundColor: 'rgba(76, 175, 80, 0.08)',
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#4CAF50',
    justifyContent: 'center',
    alignItems: 'center',
  },
  icon: {
    fontSize: 20,
  },
  content: {
    flex: 1,
    gap: 6,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  title: {
    fontSize: 16,
    color: '#4CAF50',
  },
  discountBadge: {
    backgroundColor: '#FF5252',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  discountText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  itemName: {
    fontSize: 14,
    opacity: 0.9,
  },
  priceComparison: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 4,
  },
  oldPriceContainer: {
    position: 'relative',
  },
  oldPrice: {
    fontSize: 14,
    opacity: 0.6,
  },
  strikethrough: {
    position: 'absolute',
    top: '50%',
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: '#FF5252',
  },
  arrow: {
    fontSize: 14,
    opacity: 0.6,
  },
  newPrice: {
    fontSize: 18,
    color: '#4CAF50',
  },
  timestamp: {
    fontSize: 12,
    opacity: 0.6,
    marginTop: 2,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#4CAF50',
    marginTop: 8,
  },
});
