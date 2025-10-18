import React, { createContext, useContext, useRef, useCallback } from 'react';
import type BottomSheet from '@gorhom/bottom-sheet';

interface BottomSheetContextType {
  bottomSheetRef: React.RefObject<BottomSheet | null>;
  openAddItemSheet: () => void;
  closeAddItemSheet: () => void;
  toggleAddItemSheet: () => void;
}

const BottomSheetContext = createContext<BottomSheetContextType | undefined>(undefined);

export function BottomSheetProvider({ children }: { children: React.ReactNode }) {
  const bottomSheetRef = useRef<BottomSheet>(null);

  const openAddItemSheet = useCallback(() => {
    bottomSheetRef.current?.expand();
  }, []);

  const closeAddItemSheet = useCallback(() => {
    bottomSheetRef.current?.close();
  }, []);

  const toggleAddItemSheet = useCallback(() => {
    bottomSheetRef.current?.snapToIndex(0);
  }, []);

  return (
    <BottomSheetContext.Provider
      value={{
        bottomSheetRef,
        openAddItemSheet,
        closeAddItemSheet,
        toggleAddItemSheet,
      }}>
      {children}
    </BottomSheetContext.Provider>
  );
}

export function useBottomSheet() {
  const context = useContext(BottomSheetContext);
  if (context === undefined) {
    throw new Error('useBottomSheet must be used within a BottomSheetProvider');
  }
  return context;
}
