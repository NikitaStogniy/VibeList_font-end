/**
 * Skeleton Card Component
 *
 * Displays a loading skeleton while feed items are being fetched.
 * Uses Reanimated for smooth shimmer animation.
 */

import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  interpolate,
} from 'react-native-reanimated';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';

export function SkeletonCard() {
  const colorScheme = useColorScheme();
  const shimmerAnimation = useSharedValue(0);

  useEffect(() => {
    shimmerAnimation.value = withRepeat(
      withTiming(1, { duration: 1500 }),
      -1,
      false
    );
  }, [shimmerAnimation]);

  const shimmerStyle = useAnimatedStyle(() => {
    const opacity = interpolate(shimmerAnimation.value, [0, 0.5, 1], [0.3, 0.7, 0.3]);
    return {
      opacity,
    };
  });

  const skeletonColor =
    colorScheme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)';

  return (
    <View style={[styles.card, { backgroundColor: Colors[colorScheme ?? 'light'].background }]}>
      {/* Image skeleton */}
      <Animated.View
        style={[
          styles.skeletonImage,
          shimmerStyle,
          { backgroundColor: skeletonColor },
        ]}
      />

      <View style={styles.cardContent}>
        {/* Title skeleton */}
        <Animated.View
          style={[
            styles.skeletonTitle,
            shimmerStyle,
            { backgroundColor: skeletonColor },
          ]}
        />

        {/* Description skeleton */}
        <Animated.View
          style={[
            styles.skeletonText,
            shimmerStyle,
            { backgroundColor: skeletonColor, width: '100%' },
          ]}
        />
        <Animated.View
          style={[
            styles.skeletonText,
            shimmerStyle,
            { backgroundColor: skeletonColor, width: '70%' },
          ]}
        />

        {/* Price skeleton */}
        <Animated.View
          style={[
            styles.skeletonPrice,
            shimmerStyle,
            { backgroundColor: skeletonColor },
          ]}
        />

        {/* User info skeleton */}
        <View style={styles.userInfo}>
          <Animated.View
            style={[
              styles.skeletonAvatar,
              shimmerStyle,
              { backgroundColor: skeletonColor },
            ]}
          />
          <Animated.View
            style={[
              styles.skeletonUsername,
              shimmerStyle,
              { backgroundColor: skeletonColor },
            ]}
          />
        </View>

        {/* Button skeleton */}
        <Animated.View
          style={[
            styles.skeletonButton,
            shimmerStyle,
            { backgroundColor: skeletonColor },
          ]}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 16,
  },
  skeletonImage: {
    width: '100%',
    height: 200,
  },
  cardContent: {
    padding: 16,
    gap: 8,
  },
  skeletonTitle: {
    height: 24,
    width: '60%',
    borderRadius: 4,
    marginBottom: 4,
  },
  skeletonText: {
    height: 16,
    borderRadius: 4,
  },
  skeletonPrice: {
    height: 20,
    width: '30%',
    borderRadius: 4,
    marginTop: 4,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 8,
  },
  skeletonAvatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
  },
  skeletonUsername: {
    height: 14,
    width: 80,
    borderRadius: 4,
  },
  skeletonButton: {
    height: 44,
    borderRadius: 8,
    marginTop: 12,
  },
});
