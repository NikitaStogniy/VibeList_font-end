import React from 'react';
import { View, StyleSheet, Pressable, Text, ScrollView } from 'react-native';
import { useTranslation } from '@/hooks/use-translation';
import { SheetHeader } from './sheet-header';
import { PhotoThumbnail } from './photo-thumbnail';
import { ThemedTextInput } from '@/components/themed-text-input';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import type { Currency } from './use-item-form';

interface ManualEntryViewProps {
  itemName: string;
  itemDescription: string;
  itemPrice: string;
  itemLink: string;
  imageUri: string;
  selectedCurrency: Currency;
  isSubmitting?: boolean;
  onNameChange: (text: string) => void;
  onDescriptionChange: (text: string) => void;
  onPriceChange: (text: string) => void;
  onLinkChange: (text: string) => void;
  onToggleCurrency: () => void;
  onUploadPhoto: () => void;
  onRemovePhoto: () => void;
  onBack: () => void;
  onCancel: () => void;
  onSubmit: () => void;
}

export function ManualEntryView({
  itemName,
  itemDescription,
  itemPrice,
  itemLink,
  imageUri,
  selectedCurrency,
  isSubmitting = false,
  onNameChange,
  onDescriptionChange,
  onPriceChange,
  onLinkChange,
  onToggleCurrency,
  onUploadPhoto,
  onRemovePhoto,
  onBack,
  onCancel,
  onSubmit,
}: ManualEntryViewProps) {
  const { t } = useTranslation();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <SheetHeader title={t('addItem.manualEntry')} onBack={onBack} />

      <View style={styles.fieldGroup}>
        <Text style={[styles.label, { color: colors.text }]}>
          {t('addItem.name')}
        </Text>
        <ThemedTextInput
          value={itemName}
          onChangeText={onNameChange}
          placeholder={t('addItem.namePlaceholder')}
        />
      </View>

      <View style={styles.fieldGroup}>
        <Text style={[styles.label, { color: colors.text }]}>
          {t('addItem.description')}
        </Text>
        <ThemedTextInput
          value={itemDescription}
          onChangeText={onDescriptionChange}
          placeholder={t('addItem.descriptionPlaceholder')}
          multiline
          numberOfLines={3}
        />
      </View>

      <View style={styles.fieldGroup}>
        <Text style={[styles.label, { color: colors.text }]}>
          {t('addItem.price')}
        </Text>
        <View style={styles.priceRow}>
          <ThemedTextInput
            value={itemPrice}
            onChangeText={onPriceChange}
            placeholder={t('addItem.pricePlaceholder')}
            keyboardType="decimal-pad"
            style={styles.priceInput}
          />
          <Pressable
            style={({ pressed }) => [
              styles.currencyButton,
              {
                borderColor: colors.tint,
                opacity: pressed ? 0.7 : 1,
              },
            ]}
            onPress={onToggleCurrency}
          >
            <Text style={[styles.currencyText, { color: colors.tint }]}>
              {t(`addItem.currencies.${selectedCurrency}`)}
            </Text>
          </Pressable>
        </View>
      </View>

      <View style={styles.fieldGroup}>
        <Text style={[styles.label, { color: colors.text }]}>
          {t('addItem.link')}
        </Text>
        <ThemedTextInput
          value={itemLink}
          onChangeText={onLinkChange}
          placeholder={t('addItem.linkPlaceholder')}
          keyboardType="url"
          autoCapitalize="none"
        />
      </View>

      <Pressable
        style={({ pressed }) => [
          styles.uploadButton,
          {
            borderColor: colors.tint,
            opacity: pressed ? 0.7 : 1,
          },
        ]}
        onPress={onUploadPhoto}
      >
        <Text style={[styles.uploadButtonText, { color: colors.tint }]}>
          {imageUri ? t('addItem.changePhoto') : t('addItem.uploadPhoto')}
        </Text>
      </Pressable>

      {imageUri && (
        <PhotoThumbnail imageUri={imageUri} onRemove={onRemovePhoto} />
      )}

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
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  fieldGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  priceRow: {
    flexDirection: 'row',
    gap: 12,
  },
  priceInput: {
    flex: 1,
  },
  currencyButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    borderWidth: 2,
    backgroundColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 80,
  },
  currencyText: {
    fontSize: 16,
    fontWeight: '600',
  },
  uploadButton: {
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    borderWidth: 2,
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 8,
  },
  uploadButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
    marginBottom: 24,
  },
  button: {
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  flexButton: {
    flex: 1,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});
