import React from 'react';
import { View, StyleSheet, Pressable, Text } from 'react-native';
import { useTranslation } from '@/hooks/use-translation';
import { SheetHeader } from './sheet-header';
import { ThemedTextInput } from '@/components/themed-text-input';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

interface PasteLinkViewProps {
  linkUrl: string;
  isSubmitting?: boolean;
  onLinkChange: (text: string) => void;
  onPasteFromClipboard: () => void;
  onBack: () => void;
  onCancel: () => void;
  onSubmit: () => void;
}

export function PasteLinkView({
  linkUrl,
  isSubmitting = false,
  onLinkChange,
  onPasteFromClipboard,
  onBack,
  onCancel,
  onSubmit,
}: PasteLinkViewProps) {
  const { t } = useTranslation();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  return (
    <View style={styles.container}>
      <SheetHeader title={t('addItem.pasteLink')} onBack={onBack} />

      <ThemedTextInput
        value={linkUrl}
        onChangeText={onLinkChange}
        placeholder={t('addItem.linkPlaceholder')}
        style={styles.input}
      />

      <Pressable
        style={({ pressed }) => [
          styles.button,
          styles.borderedButton,
          {
            borderColor: colors.tint,
            opacity: pressed ? 0.7 : 1,
          },
        ]}
        onPress={onPasteFromClipboard}
      >
        <Text style={[styles.buttonText, { color: colors.tint }]}>
          {t('addItem.pasteFromClipboard')}
        </Text>
      </Pressable>

      <View style={styles.buttonRow}>
        <Pressable
          style={({ pressed }) => [
            styles.button,
            styles.flexButton,
            { opacity: pressed ? 0.7 : 1 },
          ]}
          onPress={onCancel}
        >
          <Text style={[styles.buttonText, { color: colors.text }]}>
            {t('addItem.cancel')}
          </Text>
        </Pressable>

        <Pressable
          style={({ pressed }) => [
            styles.button,
            styles.flexButton,
            {
              backgroundColor: colors.tint,
              opacity: isSubmitting ? 0.5 : (pressed ? 0.7 : 1),
            },
          ]}
          onPress={onSubmit}
          disabled={isSubmitting}
        >
          <Text style={[styles.buttonText, { color: '#fff' }]}>
            {isSubmitting ? t('addItem.submitting') : t('addItem.submit')}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 16,
  },
  input: {
    marginVertical: 8,
  },
  button: {
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  borderedButton: {
    borderWidth: 2,
    backgroundColor: 'transparent',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  flexButton: {
    flex: 1,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});
