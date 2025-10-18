import React from 'react';
import { Image, Pressable, StyleSheet, View, Text } from 'react-native';
import { useTheme } from '@react-navigation/native';
import {
  THUMBNAIL_SIZE,
  REMOVE_BUTTON_SIZE,
  REMOVE_BUTTON_OFFSET,
  SHADOW_CONFIG,
} from './constants';

interface PhotoThumbnailProps {
  imageUri: string;
  onRemove: () => void;
}

export function PhotoThumbnail({ imageUri, onRemove }: PhotoThumbnailProps) {
  const theme = useTheme();

  return (
    <View style={styles.container}>
      <Image
        source={{ uri: imageUri }}
        style={[styles.thumbnail, { borderColor: theme.colors.border }]}
        resizeMode="cover"
      />
      <Pressable
        onPress={onRemove}
        style={[
          styles.removeButton,
          { backgroundColor: theme.colors.notification },
        ]}
      >
        <Text style={styles.removeButtonText}>×</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    alignSelf: 'center',
    marginVertical: 8,
  },
  thumbnail: {
    width: THUMBNAIL_SIZE,
    height: THUMBNAIL_SIZE,
    borderRadius: 12,
    borderWidth: 2,
  },
  removeButton: {
    position: 'absolute',
    top: REMOVE_BUTTON_OFFSET,
    right: REMOVE_BUTTON_OFFSET,
    width: REMOVE_BUTTON_SIZE,
    height: REMOVE_BUTTON_SIZE,
    borderRadius: REMOVE_BUTTON_SIZE / 2,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: SHADOW_CONFIG.color,
    shadowOffset: SHADOW_CONFIG.offset,
    shadowOpacity: SHADOW_CONFIG.opacity,
    shadowRadius: SHADOW_CONFIG.radius,
    elevation: SHADOW_CONFIG.elevation,
  },
  removeButtonText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: 'bold',
    lineHeight: 22,
  },
});
