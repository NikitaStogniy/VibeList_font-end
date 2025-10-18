import type { ImagePickerOptions } from 'expo-image-picker';

export const IMAGE_PICKER_CONFIG: ImagePickerOptions = {
  mediaTypes: ['images'],
  allowsEditing: true,
  aspect: [4, 3],
  quality: 0.8,
};

export const THUMBNAIL_SIZE = 120;
export const REMOVE_BUTTON_SIZE = 28;
export const REMOVE_BUTTON_OFFSET = -8;

export const SHADOW_CONFIG = {
  color: '#000',
  offset: { width: 0, height: 2 },
  opacity: 0.25,
  radius: 3.84,
  elevation: 5,
};
