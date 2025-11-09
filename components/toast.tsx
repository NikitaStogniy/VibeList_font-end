/**
 * Toast Notification System
 *
 * Lightweight toast notifications with animations.
 * Uses Reanimated for smooth enter/exit transitions.
 */

import React, { useEffect } from 'react';
import { StyleSheet, Text, Pressable } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  runOnJS,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

interface ToastProps {
  message: string;
  type?: ToastType;
  duration?: number;
  onDismiss: () => void;
}

export function Toast({
  message,
  type = 'info',
  duration = 3000,
  onDismiss,
}: ToastProps) {
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme();
  const translateY = useSharedValue(-100);
  const opacity = useSharedValue(0);

  useEffect(() => {
    // Enter animation
    translateY.value = withSpring(0, { damping: 15 });
    opacity.value = withTiming(1, { duration: 200 });

    // Auto dismiss
    const timer = setTimeout(() => {
      // Exit animation
      translateY.value = withTiming(-100, { duration: 200 });
      opacity.value = withTiming(0, { duration: 200 }, () => {
        runOnJS(onDismiss)();
      });
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onDismiss, opacity, translateY]);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateY: translateY.value }],
      opacity: opacity.value,
    };
  });

  const handlePress = () => {
    translateY.value = withTiming(-100, { duration: 200 });
    opacity.value = withTiming(0, { duration: 200 }, () => {
      runOnJS(onDismiss)();
    });
  };

  const backgroundColor = {
    success: Colors[colorScheme ?? 'light'].success,
    error: Colors[colorScheme ?? 'light'].error,
    warning: Colors[colorScheme ?? 'light'].warning,
    info: Colors[colorScheme ?? 'light'].tint,
  }[type];

  const icon = {
    success: '✓',
    error: '✕',
    warning: '⚠',
    info: 'ℹ',
  }[type];

  return (
    <Animated.View
      style={[
        styles.container,
        { top: insets.top + 10, backgroundColor },
        animatedStyle,
      ]}
    >
      <Pressable style={styles.content} onPress={handlePress}>
        <Text style={styles.icon}>{icon}</Text>
        <Text style={styles.message} numberOfLines={2}>
          {message}
        </Text>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 16,
    right: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    zIndex: 9999,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 12,
  },
  icon: {
    fontSize: 20,
    color: '#fff',
  },
  message: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
    lineHeight: 20,
  },
});
