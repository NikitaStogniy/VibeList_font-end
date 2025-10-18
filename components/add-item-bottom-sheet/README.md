# Add Item Bottom Sheet

Модульный компонент для добавления элементов в wishlist.

## Структура

```
add-item-bottom-sheet/
├── index.tsx              # Главный компонент (orchestrator)
├── menu-view.tsx          # View: выбор способа добавления
├── paste-link-view.tsx    # View: вставка ссылки
├── manual-entry-view.tsx  # View: ручной ввод
├── use-item-form.ts       # Custom hook для управления формой
├── photo-thumbnail.tsx    # Компонент preview фото
├── sheet-header.tsx       # Переиспользуемый header
├── constants.ts           # Константы конфигурации
└── README.md             # Документация
```

## Компоненты

### AddItemBottomSheet (index.tsx)
Главный компонент-оркестратор, управляющий состоянием и переключением между views.

**Использование:**
```tsx
import { AddItemBottomSheet } from '@/components/add-item-bottom-sheet';

<AddItemBottomSheet />
```

### MenuView
View компонент для выбора способа добавления элемента.

**Props:**
```ts
interface MenuViewProps {
  onSelectPasteLink: () => void;
  onSelectManualEntry: () => void;
}
```

### PasteLinkView
View компонент для добавления элемента через ссылку.

**Props:**
```ts
interface PasteLinkViewProps {
  linkUrl: string;
  onLinkChange: (text: string) => void;
  onPasteFromClipboard: () => void;
  onBack: () => void;
  onCancel: () => void;
  onSubmit: () => void;
}
```

### ManualEntryView
View компонент для ручного добавления элемента.

**Props:**
```ts
interface ManualEntryViewProps {
  itemName: string;
  itemDescription: string;
  itemPrice: string;
  itemLink: string;
  imageUri: string;
  selectedCurrency: Currency;
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
```

### useItemForm Hook
Custom hook для управления состоянием формы.

**API:**
```ts
const {
  itemForm,           // Данные формы manual entry
  linkForm,           // Данные формы paste link
  selectedCurrency,   // Текущая валюта
  updateItemField,    // Обновить поле itemForm
  updateLinkField,    // Обновить поле linkForm
  toggleCurrency,     // Переключить валюту
  resetForm,          // Сбросить все формы
  validateItemForm,   // Валидировать itemForm
  validateLinkForm,   // Валидировать linkForm
} = useItemForm();
```

### PhotoThumbnail
Компонент для отображения preview выбранного фото с кнопкой удаления.

**Props:**
```ts
interface PhotoThumbnailProps {
  imageUri: string;
  onRemove: () => void;
}
```

### SheetHeader
Переиспользуемый header с кнопкой "Назад" и заголовком.

**Props:**
```ts
interface SheetHeaderProps {
  title: string;
  onBack: () => void;
}
```

## Константы

**IMAGE_PICKER_CONFIG** - настройки ImagePicker:
- mediaTypes: ['images']
- allowsEditing: true
- aspect: [4, 3]
- quality: 0.8

**UI размеры:**
- THUMBNAIL_SIZE: 120
- REMOVE_BUTTON_SIZE: 28
- REMOVE_BUTTON_OFFSET: -8

**SHADOW_CONFIG** - конфигурация теней для кнопки удаления

## Локализация

Все строки используют i18n через `useTranslation()` hook.

Ключи перевода в `locales/{lang}.json`:
- `addItem.*` - все UI элементы
- `common.error` - заголовок ошибок
- `common.save` - заголовок успеха

## TODO
- [ ] Интеграция с API для парсинга ссылок
- [ ] Интеграция с API для создания элементов
- [ ] Добавить loading состояния
- [ ] Добавить тесты
