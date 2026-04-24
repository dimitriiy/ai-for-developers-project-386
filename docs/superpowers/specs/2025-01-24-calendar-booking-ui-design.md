# Calendar Booking UI - Design Specification

**Date:** 2025-01-24  
**Status:** Approved  
**Author:** AI Assistant  

---

## 1. Overview

### 1.1 Purpose
Система бронирования встреч с двумя ролями: владелец календаря (админ) и гости. Гости выбирают тип события, дату и время. Админ управляет типами событий и просматривает бронирования.

### 1.2 Tech Stack
- **Framework:** React 19 + TypeScript 5.9
- **Build Tool:** Vite 8
- **UI Library:** Mantine 9
- **State Management:** TanStack Query (React Query)
- **Forms:** @mantine/form
- **Routing:** react-router-dom 7
- **Mock Server:** Prism (Stoplight)
- **API Contract:** TypeSpec

---

## 2. Architecture (Feature-Sliced Design)

```
frontend/src/
├── app/                    # Application initialization
│   ├── providers/         # MantineProvider, QueryClientProvider, RouterProvider
│   ├── styles/            # Global styles, Mantine theme
│   └── router.tsx         # Route definitions
├── pages/                  # Page components (route entry points)
│   ├── home/
│   │   └── HomePage.tsx
│   ├── booking/
│   │   ├── BookingCatalogPage.tsx
│   │   └── BookingSlotsPage.tsx
│   └── admin/
│       └── AdminPage.tsx
├── widgets/                # Composite components
│   ├── header/
│   ├── event-type-card/
│   ├── calendar/
│   ├── slots-list/
│   └── host-profile/
├── features/               # User scenarios
│   ├── select-event-type/
│   ├── select-slot/
│   ├── create-booking/
│   └── manage-event-types/
├── entities/               # Business entities
│   ├── event-type/
│   ├── booking/
│   └── slot/
└── shared/                 # Reusable modules
    ├── api/               # Base API client, types
    ├── ui/                # UI kit components
    ├── lib/               # Utilities (date helpers, formatters)
    └── config/            # Configuration
```

### 2.1 Import Rules
- `shared` → can be imported by any layer
- `entities` → can import from `shared`
- `features` → can import from `entities`, `shared`
- `widgets` → can import from `features`, `entities`, `shared`
- `pages` → can import from any layer
- `app` → can import from any layer

---

## 3. Design System (Mantine Theme)

### 3.1 Color Scheme

```typescript
// app/styles/theme.ts
const theme = createTheme({
  colors: {
    // Primary orange accent (from screenshots)
    brand: [
      '#FFF5F0',  // 0 - light backgrounds
      '#FFE8DE',  // 1
      '#FFD0BC',  // 2
      '#FFB399',  // 3
      '#FF8F66',  // 4
      '#F56A1C',  // 5 - primary buttons
      '#E55A0F',  // 6 - hover state
      '#CC4F0D',  // 7
      '#A33F0A',  // 8
      '#7A2F08',  // 9
    ],
    // Gray scale
    gray: [
      '#F8F9FA',  // 0 - page background
      '#F1F3F5',  // 1 - card backgrounds
      '#E9ECEF',  // 2 - light borders
      '#DEE2E6',  // 3
      '#CED4DA',  // 4 - borders
      '#ADB5BD',  // 5 - muted text
      '#868E96',  // 6
      '#495057',  // 7 - body text
      '#343A40',  // 8
      '#212529',  // 9 - headings
    ],
  },
  primaryColor: 'brand',
  primaryShade: { light: 5, dark: 6 },
  radius: {
    xs: '4px',
    sm: '8px',
    md: '12px',
    lg: '16px',
    xl: '24px',
  },
  shadows: {
    xs: '0 1px 2px rgba(0, 0, 0, 0.03)',
    sm: '0 1px 3px rgba(0, 0, 0, 0.05)',
    md: '0 4px 6px rgba(0, 0, 0, 0.05)',
    lg: '0 10px 15px rgba(0, 0, 0, 0.05)',
  },
  fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif',
  headings: {
    fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif',
    fontWeight: '700',
  },
});
```

### 3.2 Typography
- **Headings:** font-weight 700, line-height 1.2
- **Body:** font-weight 400, line-height 1.5
- **Muted text:** gray.5

### 3.3 Spacing
- Page padding: 24px (mantine spacing xl)
- Card padding: 24px
- Grid gap: 24px
- Section gap: 48px

---

## 4. Pages

### 4.1 HomePage (`/`)

**Layout:**
- Header с логотипом Calendar (слева), кнопки "Записаться" и "Админка" (справа)
- Hero section с двумя колонками:
  - Левая: бейдж "БЫСТРАЯ ЗАПИСЬ НА ЗВОНОК", заголовок "Calendar", подзаголовок, CTA кнопка оранжевая
  - Правая: карточка "Возможности" с буллет-поинтами

**Components:**
- `widgets/header` - общий header
- `widgets/hero-section` - hero с CTA
- `widgets/features-card` - карточка возможностей

### 4.2 BookingCatalogPage (`/booking`)

**Layout:**
- Header (тот же)
- Host profile (аватар, имя "Tota", роль "Host")
- Заголовок "Выберите тип события"
- Подзаголовок "Нажмите на карточку, чтобы открыть календарь и выбрать удобный слот"
- Grid с карточками типов событий (2 карточки в ряд)

**Event Type Card:**
- Название (слева)
- Бейдж с длительностью (справа) - серый фон, скругленный
- Описание под названием
- Серая граница, белый фон, скругление

**Components:**
- `widgets/host-profile` - профиль владельца
- `widgets/event-type-card` - карточка типа события
- `features/select-event-type` - логика выбора и навигации

### 4.3 BookingSlotsPage (`/booking/:eventTypeId`)

**Layout (3 колонки):**

**Левая колонка (info card):**
- Host profile (компактный)
- Название типа события с бейджем длительности
- Описание
- Выбранная дата (серая карточка)
- Выбранное время (серая карточка, "Время не выбрано" по умолчанию)

**Центральная колонка (calendar):**
- Заголовок "Календарь" с кнопками навигации (< >)
- Текущий месяц и год
- Сетка дней недели (Пн-Вс)
- Календарная сетка:
  - Текущий месяц - черный текст
  - Другие месяцы - серый текст
  - Выбранный день - обводка/фон
  - Дни с доступными слотами - дополнительная метка

**Правая колонка (slots):**
- Заголовок "Статус слотов"
- Список слотов на выбранную дату:
  - Время (09:00 - 09:15)
  - Статус ("Занято" / "Свободно")
  - Занято - серый текст
  - Свободно - черный текст + hover
- Кнопки "Назад" (outline) и "Продолжить" (primary orange, disabled пока время не выбрано)

**Components:**
- `widgets/calendar` - календарь с навигацией
- `widgets/slots-list` - список слотов
- `features/select-slot` - логика выбора слота
- `features/create-booking` - модальное окно с формой

### 4.4 AdminPage (`/admin`)

**Layout:**
- Header
- Табы: "Бронирования" | "Типы событий"

**Tab 1 - Бронирования:**
- Таблица с колонками:
  - Тип события
  - Имя гостя
  - Email
  - Дата и время
  - Длительность
- Сортировка по дате (ближайшие сверху)

**Tab 2 - Типы событий:**
- Кнопка "Создать тип события" (primary)
- Таблица с колонками:
  - Название
  - Описание
  - Длительность
  - Действия (Edit, Delete)
- Модальное окно для создания/редактирования:
  - Название (input)
  - Описание (textarea)
  - Длительность (number input, минимум 1)
  - Кнопки "Отмена" и "Сохранить"

**Components:**
- `features/manage-event-types` - CRUD операции
- `widgets/bookings-table` - таблица бронирований
- `widgets/event-types-table` - таблица типов событий

---

## 5. Data Flow

### 5.1 API Layer

Base URL: `http://localhost:3000` (Prism mock server)

**Types (from TypeSpec):**
```typescript
// entities/event-type/model.ts
interface EventType {
  id: string;
  name: string;
  description: string;
  duration: number;
}

// entities/booking/model.ts
interface Booking {
  id: string;
  eventTypeId: string;
  guestName: string;
  guestEmail: string;
  startTime: string; // ISO 8601
  endTime: string;   // ISO 8601
}

// entities/slot/model.ts
type SlotStatus = 'free' | 'busy';

interface Slot {
  startTime: string;
  endTime: string;
  status: SlotStatus;
}
```

### 5.2 API Functions (shared/api/)

```typescript
// shared/api/event-types.ts
export const getEventTypes = () => 
  api.get<EventType[]>('/api/event-types');

export const getEventType = (id: string) => 
  api.get<EventType>(`/api/event-types/${id}`);

// shared/api/slots.ts
export const getSlots = (eventTypeId: string, date?: string) => 
  api.get<Slot[]>(`/api/event-types/${eventTypeId}/slots`, { params: { date } });

// shared/api/bookings.ts
export const getBookings = () => 
  api.get<Booking[]>('/api/admin/bookings');

export const createBooking = (data: BookingCreate) => 
  api.post<Booking>('/api/bookings', data);

// shared/api/admin-event-types.ts
export const getAdminEventTypes = () => 
  api.get<EventType[]>('/api/admin/event-types');

export const createEventType = (data: EventTypeCreate) => 
  api.post<EventType>('/api/admin/event-types', data);

export const updateEventType = (id: string, data: EventTypeUpdate) => 
  api.patch<EventType>(`/api/admin/event-types/${id}`, data);

export const deleteEventType = (id: string) => 
  api.delete(`/api/admin/event-types/${id}`);
```

### 5.3 React Query Hooks

```typescript
// entities/event-type/queries.ts
export const useEventTypes = () => useQuery({
  queryKey: ['event-types'],
  queryFn: getEventTypes,
});

export const useEventType = (id: string) => useQuery({
  queryKey: ['event-type', id],
  queryFn: () => getEventType(id),
  enabled: !!id,
});

// entities/slot/queries.ts
export const useSlots = (eventTypeId: string, date?: string) => useQuery({
  queryKey: ['slots', eventTypeId, date],
  queryFn: () => getSlots(eventTypeId, date),
  enabled: !!eventTypeId,
});

// entities/booking/queries.ts
export const useBookings = () => useQuery({
  queryKey: ['bookings'],
  queryFn: getBookings,
});

export const useCreateBooking = () => useMutation({
  mutationFn: createBooking,
});

// features/manage-event-types/queries.ts
export const useAdminEventTypes = () => useQuery({
  queryKey: ['admin-event-types'],
  queryFn: getAdminEventTypes,
});

export const useCreateEventType = () => useMutation({
  mutationFn: createEventType,
});

export const useUpdateEventType = () => useMutation({
  mutationFn: ({ id, data }: { id: string; data: EventTypeUpdate }) => 
    updateEventType(id, data),
});

export const useDeleteEventType = () => useMutation({
  mutationFn: deleteEventType,
});
```

### 5.4 State Management
- **Server state:** React Query (caching, refetching, optimistic updates)
- **Client state:** React useState for:
  - Выбранная дата в календаре
  - Выбранный слот
  - Открытые модалки
  - Форма бронирования

---

## 6. Mock Server (Prism)

### 6.1 Setup
```bash
# Install Prism globally or locally
npm install -g @stoplight/prism-cli

# Run mock server
cd typespec
prism mock main.tsp
```

### 6.2 Makefile Commands
Add to Makefile:
```makefile
.PHONY: mock-server install-typespec

# Install TypeSpec dependencies
install-typespec:
	cd typespec && npm install

# Start Prism mock server
mock-server:
	cd typespec && npx @stoplight/prism-cli mock main.tsp
```

### 6.3 Mock Data
Prism автоматически генерирует мок-данные на основе TypeSpec схемы.

---

## 7. UI Components (shared/ui/)

### 7.1 Button
- Mantine Button с темой проекта
- Variants: filled (orange), outline, subtle
- Sizes: sm, md, lg

### 7.2 Card
- Белый фон, border gray.2, radius lg
- shadow sm

### 7.3 Badge
- Для длительности: variant="light", color="gray"
- Скругленные края

### 7.4 Calendar
- Кастомный компонент на основе Mantine
- Навигация по месяцам
- Выделение текущего дня
- Выделение выбранного дня

### 7.5 SlotItem
- Flex row с временем и статусом
- Статус "Занято" - muted text
- Статус "Свободно" - hover effect

---

## 8. Forms

### 8.1 Booking Form (Modal)
```typescript
interface BookingFormValues {
  guestName: string;
  guestEmail: string;
}

// Validation with @mantine/form
const form = useForm({
  initialValues: { guestName: '', guestEmail: '' },
  validate: {
    guestName: (value) => value.length < 2 ? 'Имя должно быть не менее 2 символов' : null,
    guestEmail: (value) => /^\S+@\S+$/.test(value) ? null : 'Некорректный email',
  },
});
```

### 8.2 Event Type Form (Modal)
```typescript
interface EventTypeFormValues {
  name: string;
  description: string;
  duration: number;
}

// Validation
const form = useForm({
  initialValues: { name: '', description: '', duration: 30 },
  validate: {
    name: (value) => value.length < 2 ? 'Название обязательно' : null,
    duration: (value) => value < 1 ? 'Длительность минимум 1 минута' : null,
  },
});
```

---

## 9. Error Handling

### 9.1 API Errors
- 404 - Показывать "Not Found" страницу или сообщение
- 409 - Conflict (слот уже занят) - показывать toast уведомление
- 422 - Validation error - показывать ошибки под полями

### 9.2 Loading States
- Skeleton loaders для таблиц и списков
- Spinner для кнопок во время мутаций
- Placeholder для календаря при загрузке

---

## 10. Responsive Design

### Breakpoints (Mantine defaults)
- xs: 0-576px (mobile)
- sm: 576-768px (tablet)
- md: 768-992px (small desktop)
- lg: 992-1200px (desktop)
- xl: 1200px+ (large desktop)

### Mobile Adaptations
- BookingSlotsPage: колонки становятся вертикальным списком
- AdminPage: таблицы с горизонтальным скроллом
- Header: кнопки в меню-бургер

---

## 11. Dependencies to Add

```json
{
  "dependencies": {
    "@tanstack/react-query": "^5.x",
    "date-fns": "^3.x"
  }
}
```

---

## 12. Summary

### Pages to Implement
1. HomePage (`/`) - Landing с CTA
2. BookingCatalogPage (`/booking`) - выбор типа события
3. BookingSlotsPage (`/booking/:eventTypeId`) - календарь и слоты
4. AdminPage (`/admin`) - табы с бронированиями и типами событий

### Key Features
- Полная интеграция с TypeSpec API
- Prism mock server для разработки
- FSD архитектура
- Mantine design system
- React Query для server state

### Success Criteria
- [ ] Все 4 страницы работают с mock server
- [ ] Дизайн соответствует скриншотам
- [ ] Валидация форм работает
- [ ] CRUD типов событий в админке
- [ ] Бронирование слотов работает
