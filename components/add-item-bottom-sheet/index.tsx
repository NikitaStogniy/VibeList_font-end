import { useBottomSheet } from '@/contexts/bottom-sheet-context';
import { useTranslation } from '@/hooks/use-translation';
import BottomSheet, { BottomSheetView, BottomSheetBackdrop } from '@gorhom/bottom-sheet';
import React, { useState, useCallback, useMemo } from 'react';
import { Alert, StyleSheet } from 'react-native';
import * as Clipboard from 'expo-clipboard';
import * as ImagePicker from 'expo-image-picker';
import { useItemForm } from './use-item-form';
import { MenuView } from './menu-view';
import { PasteLinkView } from './paste-link-view';
import { ManualEntryView } from './manual-entry-view';
import { IMAGE_PICKER_CONFIG } from './constants';
import type { BottomSheetDefaultBackdropProps } from '@gorhom/bottom-sheet/lib/typescript/components/bottomSheetBackdrop/types';
import { useCreateItemMutation, useParseUrlMutation } from '@/store/api';
import type { CreateItemRequest } from '@/types/api';

type ViewMode = 'menu' | 'pasteLink' | 'manualEntry';

export function AddItemBottomSheet() {
  const { bottomSheetRef, closeAddItemSheet } = useBottomSheet();
  const { t } = useTranslation();
  const {
    itemForm,
    linkForm,
    selectedCurrency,
    updateItemField,
    updateLinkField,
    toggleCurrency,
    resetForm,
    validateItemForm,
    validateLinkForm,
  } = useItemForm();

  const [viewMode, setViewMode] = useState<ViewMode>('menu');
  const [createItem, { isLoading: isCreating }] = useCreateItemMutation();
  const [parseUrl, { isLoading: isParsing }] = useParseUrlMutation();

  const handleClose = useCallback(() => {
    setViewMode('menu');
    resetForm();
    closeAddItemSheet();
  }, [resetForm, closeAddItemSheet]);

  const handlePasteFromClipboard = useCallback(async () => {
    try {
      const text = await Clipboard.getStringAsync();
      if (text) {
        updateLinkField('url', text);
      } else {
        Alert.alert(t('common.error'), t('addItem.clipboardEmpty'));
      }
    } catch {
      Alert.alert(t('common.error'), t('addItem.clipboardFailed'));
    }
  }, [t, updateLinkField]);

  const handleUploadPhoto = useCallback(async () => {
    try {
      const permissionResult =
        await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (permissionResult.granted === false) {
        Alert.alert(t('common.error'), t('addItem.permissionRequired'));
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync(
        IMAGE_PICKER_CONFIG
      );

      if (!result.canceled && result.assets[0]) {
        updateItemField('imageUri', result.assets[0].uri);
      }
    } catch {
      Alert.alert(t('common.error'), t('addItem.imageFailed'));
    }
  }, [t, updateItemField]);

  const handleRemovePhoto = useCallback(() => {
    updateItemField('imageUri', '');
  }, [updateItemField]);

  const handleSubmit = useCallback(async () => {
    if (viewMode === 'pasteLink') {
      const error = validateLinkForm();
      if (error) {
        Alert.alert(t('common.error'), t(error));
        return;
      }

      try {
        // Parse URL to extract metadata
        const result = await parseUrl({ url: linkForm.url }).unwrap();

        // Create item with parsed data
        const itemData: CreateItemRequest = {
          name: result.name || 'Untitled Item',
          description: result.description,
          price: result.price,
          currency: result.currency || 'usd',
          productUrl: linkForm.url,
          imageUrl: result.imageUrl,
          isPublic: true,
        };

        await createItem(itemData).unwrap();
        Alert.alert(t('common.save'), t('addItem.submitSuccess'));
        handleClose();
      } catch (err: any) {
        console.error('Failed to create item from link:', err);
        Alert.alert(
          t('common.error'),
          err?.data?.message || t('addItem.submitFailed')
        );
      }
    } else if (viewMode === 'manualEntry') {
      const error = validateItemForm();
      if (error) {
        Alert.alert(t('common.error'), t(error));
        return;
      }

      try {
        const itemData: CreateItemRequest = {
          name: itemForm.name,
          description: itemForm.description || undefined,
          price: itemForm.price ? parseFloat(itemForm.price) : undefined,
          currency: selectedCurrency,
          productUrl: itemForm.link || undefined,
          // Note: imageUri is local file path, would need upload to S3/CDN
          // For now, skip image upload or implement separately
          imageUrl: undefined,
          isPublic: true,
        };

        console.log('Submitting item:', itemData);
        await createItem(itemData).unwrap();
        Alert.alert(t('common.save'), t('addItem.submitSuccess'));
        handleClose();
      } catch (err: any) {
        console.error('Failed to create item:', err);
        Alert.alert(
          t('common.error'),
          err?.data?.message || t('addItem.submitFailed')
        );
      }
    }
  }, [
    viewMode,
    validateLinkForm,
    validateItemForm,
    linkForm.url,
    itemForm,
    selectedCurrency,
    t,
    handleClose,
    createItem,
    parseUrl,
  ]);

  // Define snap points
  const snapPoints = useMemo(() => ['85%'], []);

  // Render backdrop
  const renderBackdrop = useCallback(
    (props: BottomSheetDefaultBackdropProps) => (
      <BottomSheetBackdrop
        {...props}
        disappearsOnIndex={-1}
        appearsOnIndex={0}
        opacity={0.5}
      />
    ),
    []
  );

  return (
    <BottomSheet
      ref={bottomSheetRef}
      index={-1}
      snapPoints={snapPoints}
      enablePanDownToClose
      backdropComponent={renderBackdrop}
      onClose={handleClose}
    >
      <BottomSheetView style={styles.contentContainer}>
        {viewMode === 'menu' && (
          <MenuView
            onSelectPasteLink={() => setViewMode('pasteLink')}
            onSelectManualEntry={() => setViewMode('manualEntry')}
          />
        )}

        {viewMode === 'pasteLink' && (
          <PasteLinkView
            linkUrl={linkForm.url}
            isSubmitting={isParsing || isCreating}
            onLinkChange={(text) => updateLinkField('url', text)}
            onPasteFromClipboard={handlePasteFromClipboard}
            onBack={() => setViewMode('menu')}
            onCancel={handleClose}
            onSubmit={handleSubmit}
          />
        )}

        {viewMode === 'manualEntry' && (
          <ManualEntryView
            itemName={itemForm.name}
            itemDescription={itemForm.description}
            itemPrice={itemForm.price}
            itemLink={itemForm.link}
            imageUri={itemForm.imageUri}
            selectedCurrency={selectedCurrency}
            isSubmitting={isCreating}
            onNameChange={(text) => updateItemField('name', text)}
            onDescriptionChange={(text) => updateItemField('description', text)}
            onPriceChange={(text) => updateItemField('price', text)}
            onLinkChange={(text) => updateItemField('link', text)}
            onToggleCurrency={toggleCurrency}
            onUploadPhoto={handleUploadPhoto}
            onRemovePhoto={handleRemovePhoto}
            onBack={() => setViewMode('menu')}
            onCancel={handleClose}
            onSubmit={handleSubmit}
          />
        )}
      </BottomSheetView>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  contentContainer: {
    flex: 1,
    padding: 24,
  },
});
