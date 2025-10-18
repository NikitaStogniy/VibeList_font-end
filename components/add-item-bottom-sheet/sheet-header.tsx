import React from 'react';
import { View, StyleSheet, Pressable, Text } from 'react-native';
import { useTranslation } from '@/hooks/use-translation';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { IconSymbol } from '@/components/ui/icon-symbol';

interface SheetHeaderProps {
  title: string;
  onBack: () => void;
}

export function SheetHeader({ title, onBack }: SheetHeaderProps) {
  const { t } = useTranslation();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  return (
    <View style={styles.header}>
      <Pressable
        onPress={onBack}
        style={({ pressed }) => [
          styles.backButton,
          { opacity: pressed ? 0.5 : 1 },
        ]}
      >
        <IconSymbol size={24} name="chevron.left" color={colors.tint} />
        <Text style={[styles.backText, { color: colors.tint }]}>
          {t('addItem.back')}
        </Text>
      </Pressable>
      <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    marginBottom: 16,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 4,
  },
  backText: {
    fontSize: 16,
    fontWeight: '500',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
});
