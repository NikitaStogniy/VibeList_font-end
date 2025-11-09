import React from 'react';
import { View, StyleSheet, Pressable, Text, ScrollView } from 'react-native';
import { useTranslation } from '@/hooks/use-translation';
import { SheetHeader } from './sheet-header';
import { PhotoThumbnail } from './photo-thumbnail';
import { ThemedTextInput } from '@/components/themed-text-input';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import type { Currency } from './use-item-form';
import type { WishlistItem } from '@/types/api';

interface EditItemViewProps {
  item: Partial<WishlistItem>;
  warnings: string[];
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

export function EditItemView({
  item,
  warnings,
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
}: EditItemViewProps) {
  const { t } = useTranslation();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  // Determine which fields are missing based on warnings
  const missingFields = {
    name: warnings.some(w => w.toLowerCase().includes('title') || w.toLowerCase().includes('name')),
    price: warnings.some(w => w.toLowerCase().includes('price')),
    description: warnings.some(w => w.toLowerCase().includes('description')),
    image: warnings.some(w => w.toLowerCase().includes('image')),
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <SheetHeader title={t('addItem.editItem')} onBack={onBack} />

      {/* Warning Banner */}
      {warnings.length > 0 && (
        <View style={[styles.warningBanner, { backgroundColor: colors.tint + '15', borderColor: colors.tint }]}>
          <Text style={[styles.warningIcon, { color: colors.tint }]}>⚠️</Text>
          <View style={styles.warningContent}>
            <Text style={[styles.warningTitle, { color: colors.text }]}>
              {t('addItem.partialParsing')}
            </Text>
            <Text style={[styles.warningText, { color: colors.icon }]}>
              {t('addItem.missingFields')}: {warnings.join(', ')}
            </Text>
          </View>
        </View>
      )}

      {/* Item Name */}
      <View style={styles.fieldGroup}>
        <View style={styles.labelRow}>
          <Text style={[styles.label, { color: colors.text }]}>
            {t('addItem.name')}
          </Text>
          {missingFields.name && (
            <Text style={[styles.requiredBadge, { color: '#FF6B6B' }]}>
              * {t('addItem.required')}
            </Text>
          )}
        </View>
        <ThemedTextInput
          value={itemName}
          onChangeText={onNameChange}
          placeholder={t('addItem.namePlaceholder')}
          style={missingFields.name ? styles.missingField : undefined}
        />
      </View>

      {/* Description */}
      <View style={styles.fieldGroup}>
        <View style={styles.labelRow}>
          <Text style={[styles.label, { color: colors.text }]}>
            {t('addItem.description')}
          </Text>
          {missingFields.description && (
            <Text style={[styles.optionalBadge, { color: colors.icon }]}>
              {t('addItem.optional')}
            </Text>
          )}
        </View>
        <ThemedTextInput
          value={itemDescription}
          onChangeText={onDescriptionChange}
          placeholder={t('addItem.descriptionPlaceholder')}
          multiline
          numberOfLines={3}
          style={missingFields.description ? styles.missingField : undefined}
        />
      </View>

      {/* Price */}
      <View style={styles.fieldGroup}>
        <View style={styles.labelRow}>
          <Text style={[styles.label, { color: colors.text }]}>
            {t('addItem.price')}
          </Text>
          {missingFields.price && (
            <Text style={[styles.optionalBadge, { color: colors.icon }]}>
              {t('addItem.optional')}
            </Text>
          )}
        </View>
        <View style={styles.priceRow}>
          <ThemedTextInput
            value={itemPrice}
            onChangeText={onPriceChange}
            placeholder={t('addItem.pricePlaceholder')}
            keyboardType="decimal-pad"
            style={[styles.priceInput, missingFields.price ? styles.missingField : undefined]}
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
        {missingFields.price && (
          <Text style={[styles.hint, { color: colors.icon }]}>
            💡 {t('addItem.priceMonitoringHint')}
          </Text>
        )}
      </View>

      {/* Link (read-only if already present) */}
      {item.productUrl && (
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
            editable={false}
            style={styles.readOnlyField}
          />
        </View>
      )}

      {/* Image Upload */}
      <Pressable
        style={({ pressed }) => [
          styles.uploadButton,
          {
            borderColor: missingFields.image ? '#FF6B6B' : colors.tint,
            opacity: pressed ? 0.7 : 1,
          },
        ]}
        onPress={onUploadPhoto}
      >
        <Text style={[styles.uploadButtonText, { color: missingFields.image ? '#FF6B6B' : colors.tint }]}>
          {imageUri ? t('addItem.changePhoto') : t('addItem.uploadPhoto')}
          {missingFields.image && ' *'}
        </Text>
      </Pressable>

      {imageUri && (
        <PhotoThumbnail imageUri={imageUri} onRemove={onRemovePhoto} />
      )}

      {/* Action Buttons */}
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
  warningBanner: {
    flexDirection: 'row',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 16,
    gap: 12,
  },
  warningIcon: {
    fontSize: 20,
  },
  warningContent: {
    flex: 1,
  },
  warningTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  warningText: {
    fontSize: 12,
  },
  fieldGroup: {
    marginBottom: 16,
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
  },
  requiredBadge: {
    fontSize: 12,
    fontWeight: '600',
  },
  optionalBadge: {
    fontSize: 12,
    fontStyle: 'italic',
  },
  missingField: {
    borderColor: '#FF6B6B',
    borderWidth: 1.5,
  },
  readOnlyField: {
    opacity: 0.6,
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
  hint: {
    fontSize: 12,
    marginTop: 6,
    fontStyle: 'italic',
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
