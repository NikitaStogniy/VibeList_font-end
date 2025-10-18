import { StyleSheet, TextInput, type TextInputProps } from 'react-native';

import { useThemeColor } from '@/hooks/use-theme-color';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export type ThemedTextInputProps = TextInputProps & {
  lightColor?: string;
  darkColor?: string;
  lightBorderColor?: string;
  darkBorderColor?: string;
  lightPlaceholderColor?: string;
  darkPlaceholderColor?: string;
};

export function ThemedTextInput({
  style,
  lightColor,
  darkColor,
  lightBorderColor,
  darkBorderColor,
  lightPlaceholderColor,
  darkPlaceholderColor,
  ...rest
}: ThemedTextInputProps) {
  const colorScheme = useColorScheme();
  const textColor = useThemeColor({ light: lightColor, dark: darkColor }, 'text');
  const borderColor = useThemeColor(
    { light: lightBorderColor, dark: darkBorderColor },
    'border'
  );
  const backgroundColor = useThemeColor({ light: '#ffffff', dark: '#1a1a1a' }, 'background');
  const themedPlaceholderColor = useThemeColor(
    { light: lightPlaceholderColor, dark: darkPlaceholderColor },
    'text'
  );
  const placeholderColor = lightPlaceholderColor || darkPlaceholderColor
    ? themedPlaceholderColor
    : Colors[colorScheme ?? 'light'].tabIconDefault;

  return (
    <TextInput
      style={[
        styles.input,
        {
          color: textColor,
          borderColor: borderColor,
          backgroundColor: backgroundColor,
        },
        style,
      ]}
      placeholderTextColor={placeholderColor}
      {...rest}
    />
  );
}

const styles = StyleSheet.create({
  input: {
    fontSize: 16,
    lineHeight: 24,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderRadius: 8,
    minHeight: 48,
  },
});
