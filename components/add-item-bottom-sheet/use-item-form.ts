import { useState, useCallback, useMemo } from 'react';
import { useTranslation } from '@/hooks/use-translation';
import type { WishlistItem } from '@/types/api';

export type Currency = 'rub' | 'usd' | 'eur';

export interface ItemFormData {
  name: string;
  description: string;
  price: string;
  currency: Currency;
  link: string;
  imageUri: string;
}

export interface LinkFormData {
  url: string;
}

const INITIAL_ITEM_FORM: ItemFormData = {
  name: '',
  description: '',
  price: '',
  currency: 'usd',
  link: '',
  imageUri: '',
};

const INITIAL_LINK_FORM: LinkFormData = {
  url: '',
};

const getCurrencyOrder = (language: string): Currency[] => {
  const locale = language.toLowerCase();
  if (locale.startsWith('ru')) {
    return ['rub', 'usd', 'eur'];
  } else if (locale.startsWith('en')) {
    return ['usd', 'eur', 'rub'];
  } else {
    // Default for Spanish and others
    return ['eur', 'usd', 'rub'];
  }
};

export function useItemForm() {
  const { language } = useTranslation();
  const [itemForm, setItemForm] = useState<ItemFormData>(INITIAL_ITEM_FORM);
  const [linkForm, setLinkForm] = useState<LinkFormData>(INITIAL_LINK_FORM);
  const [currencyIndex, setCurrencyIndex] = useState(0);

  const currencies = useMemo(() => getCurrencyOrder(language), [language]);
  const selectedCurrency = currencies[currencyIndex];

  const updateItemField = useCallback(
    <K extends keyof ItemFormData>(field: K, value: ItemFormData[K]) => {
      setItemForm((prev) => ({ ...prev, [field]: value }));
    },
    []
  );

  const updateLinkField = useCallback(
    <K extends keyof LinkFormData>(field: K, value: LinkFormData[K]) => {
      setLinkForm((prev) => ({ ...prev, [field]: value }));
    },
    []
  );

  const toggleCurrency = useCallback(() => {
    setCurrencyIndex((prev) => {
      const nextIndex = (prev + 1) % currencies.length;
      setItemForm((prevForm) => ({
        ...prevForm,
        currency: currencies[nextIndex],
      }));
      return nextIndex;
    });
  }, [currencies]);

  const resetForm = useCallback(() => {
    setItemForm(INITIAL_ITEM_FORM);
    setLinkForm(INITIAL_LINK_FORM);
    setCurrencyIndex(0);
  }, []);

  const initializeFromItem = useCallback((item: Partial<WishlistItem>) => {
    setItemForm({
      name: item.name || '',
      description: item.description || '',
      price: item.price ? item.price.toString() : '',
      currency: (item.currency?.toLowerCase() as Currency) || 'usd',
      link: item.productUrl || '',
      imageUri: item.imageUrl || '',
    });

    // Set currency index based on item currency
    if (item.currency) {
      const itemCurrency = item.currency.toLowerCase() as Currency;
      const index = currencies.findIndex(c => c === itemCurrency);
      if (index !== -1) {
        setCurrencyIndex(index);
      }
    }

    // Set link form if productUrl exists
    if (item.productUrl) {
      setLinkForm({ url: item.productUrl });
    }
  }, [currencies]);

  const validateItemForm = useCallback((): string | null => {
    if (!itemForm.name.trim()) {
      return 'addItem.nameRequired';
    }
    return null;
  }, [itemForm.name]);

  const validateLinkForm = useCallback((): string | null => {
    if (!linkForm.url.trim()) {
      return 'addItem.linkRequired';
    }
    return null;
  }, [linkForm.url]);

  return {
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
  };
}
