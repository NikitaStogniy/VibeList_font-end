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
import { EditItemView } from './edit-item-view';
import { IMAGE_PICKER_CONFIG } from './constants';
import type { BottomSheetDefaultBackdropProps } from '@gorhom/bottom-sheet/lib/typescript/components/bottomSheetBackdrop/types';
import { useCreateItemMutation, useUpdateItemMutation } from '@/store/api';
import type { CreateItemRequest, WishlistItem } from '@/types/api';
import { uploadImage } from '@/utils/imageUpload';
import { useSelector } from 'react-redux';
import type { RootState } from '@/store';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';

type ViewMode = 'menu' | 'pasteLink' | 'manualEntry' | 'editItem';

export function AddItemBottomSheet() {
  const { bottomSheetRef, closeAddItemSheet } = useBottomSheet();
  const { t } = useTranslation();
  const token = useSelector((state: RootState) => state.auth.token);
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const {
    itemForm,
    linkForm,
    selectedCurrency,
    updateItemField,
    updateLinkField,
    toggleCurrency,
    resetForm,
    initializeFromItem,
    validateItemForm,
    validateLinkForm,
  } = useItemForm();

  const [viewMode, setViewMode] = useState<ViewMode>('menu');
  const [warnings, setWarnings] = useState<string[]>([]);
  const [partialItem, setPartialItem] = useState<Partial<WishlistItem> | null>(null);
  const [createItem, { isLoading: isCreating }] = useCreateItemMutation();
  const [updateItem, { isLoading: isUpdating }] = useUpdateItemMutation();

  const handleClose = useCallback(() => {
    setViewMode('menu');
    setWarnings([]);
    setPartialItem(null);
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
        // Create item directly from URL - backend will parse it
        const itemData: CreateItemRequest = {
          productUrl: linkForm.url,
          isPublic: true,
        };

        const result = await createItem(itemData).unwrap();

        // Check if there are warnings (partial parsing)
        if (result.warnings && result.warnings.length > 0) {
          console.log('Partial parsing detected, warnings:', result.warnings);
          setWarnings(result.warnings);
          setPartialItem(result.item);

          // Initialize form with parsed data
          initializeFromItem(result.item);

          // Switch to edit mode
          setViewMode('editItem');

          Alert.alert(
            t('addItem.partialParsing'),
            t('addItem.pleaseCompleteDetails')
          );
        } else {
          // Successful creation without warnings
          Alert.alert(t('common.success'), t('addItem.submitSuccess'));
          handleClose();
        }
      } catch (err: any) {
        console.error('Failed to create item from link:', err);

        // Check if it's a timeout error
        const errorMessage = err?.data?.message || '';
        if (errorMessage.includes('timeout') || errorMessage.includes('Timeout')) {
          Alert.alert(
            t('common.error'),
            t('addItem.parsingTimeout')
          );
        } else if (errorMessage.includes('Invalid URL') || errorMessage.includes('valid URL')) {
          Alert.alert(
            t('common.error'),
            t('addItem.invalidUrl')
          );
        } else {
          Alert.alert(
            t('common.error'),
            errorMessage || t('addItem.submitFailed')
          );
        }
      }
    } else if (viewMode === 'editItem') {
      // Handle editing partially parsed item
      const error = validateItemForm();
      if (error) {
        Alert.alert(t('common.error'), t(error));
        return;
      }

      if (!partialItem?.id) {
        Alert.alert(t('common.error'), 'Item ID not found');
        return;
      }

      try {
        let uploadedImageUrl: string | undefined = partialItem.imageUrl;

        // Upload new image if changed
        if (itemForm.imageUri && itemForm.imageUri !== partialItem.imageUrl && token) {
          try {
            const uploadResult = await uploadImage(
              { uri: itemForm.imageUri },
              token
            );

            if (uploadResult.success && uploadResult.url) {
              uploadedImageUrl = uploadResult.url;
            }
          } catch (uploadError) {
            console.error('Image upload error:', uploadError);
          }
        }

        const updateData = {
          name: itemForm.name,
          description: itemForm.description || undefined,
          price: itemForm.price ? parseFloat(itemForm.price) : undefined,
          currency: selectedCurrency,
          imageUrl: uploadedImageUrl,
        };

        await updateItem({ itemId: partialItem.id, data: updateData }).unwrap();
        Alert.alert(t('common.success'), t('addItem.submitSuccess'));
        handleClose();
      } catch (err: any) {
        console.error('Failed to update item:', err);
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
        let uploadedImageUrl: string | undefined = undefined;

        // Upload image if present
        if (itemForm.imageUri && token) {
          try {
            const uploadResult = await uploadImage(
              {
                uri: itemForm.imageUri,
              },
              token
            );

            if (uploadResult.success && uploadResult.url) {
              uploadedImageUrl = uploadResult.url;
            } else {
              console.warn('Image upload failed:', uploadResult.error);
              // Continue without image rather than failing completely
            }
          } catch (uploadError) {
            console.error('Image upload error:', uploadError);
            // Continue without image rather than failing completely
          }
        }

        const itemData: CreateItemRequest = {
          name: itemForm.name,
          description: itemForm.description || undefined,
          price: itemForm.price ? parseFloat(itemForm.price) : undefined,
          currency: selectedCurrency,
          productUrl: itemForm.link || undefined,
          imageUrl: uploadedImageUrl,
          isPublic: true,
        };

        console.log('Submitting item:', itemData);
        await createItem(itemData).unwrap();
        Alert.alert(t('common.save'), t('addItem.submitSuccess'));
        handleClose();
      } catch (err: unknown) {
        console.error('Failed to create item:', err);
        const errorMessage = err && typeof err === 'object' && 'data' in err
          ? (err.data as { message?: string }).message || t('addItem.submitFailed')
          : t('addItem.submitFailed');
        Alert.alert(t('common.error'), errorMessage);
      }
    }
  }, [
    viewMode,
    validateLinkForm,
    validateItemForm,
    linkForm.url,
    itemForm,
    selectedCurrency,
    token,
    partialItem,
    t,
    handleClose,
    createItem,
    updateItem,
    initializeFromItem,
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
      backgroundStyle={{ backgroundColor: colors.modalBackground }}
    >
      <BottomSheetView style={[styles.contentContainer, { backgroundColor: colors.modalBackground }]}>
        {viewMode === 'menu' && (
          <MenuView
            onSelectPasteLink={() => setViewMode('pasteLink')}
            onSelectManualEntry={() => setViewMode('manualEntry')}
          />
        )}

        {viewMode === 'pasteLink' && (
          <PasteLinkView
            linkUrl={linkForm.url}
            isSubmitting={isCreating}
            onLinkChange={(text) => updateLinkField('url', text)}
            onPasteFromClipboard={handlePasteFromClipboard}
            onBack={() => setViewMode('menu')}
            onCancel={handleClose}
            onSubmit={handleSubmit}
          />
        )}

        {viewMode === 'editItem' && partialItem && (
          <EditItemView
            item={partialItem}
            warnings={warnings}
            itemName={itemForm.name}
            itemDescription={itemForm.description}
            itemPrice={itemForm.price}
            itemLink={itemForm.link}
            imageUri={itemForm.imageUri}
            selectedCurrency={selectedCurrency}
            isSubmitting={isUpdating}
            onNameChange={(text) => updateItemField('name', text)}
            onDescriptionChange={(text) => updateItemField('description', text)}
            onPriceChange={(text) => updateItemField('price', text)}
            onLinkChange={(text) => updateItemField('link', text)}
            onToggleCurrency={toggleCurrency}
            onUploadPhoto={handleUploadPhoto}
            onRemovePhoto={handleRemovePhoto}
            onBack={() => setViewMode('pasteLink')}
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
