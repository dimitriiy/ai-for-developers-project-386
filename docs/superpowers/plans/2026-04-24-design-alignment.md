# Design Alignment Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Align all three guest-facing screens (Home, Booking Catalog, Booking Slots) with the provided design mockups and add e2e test for the Home page.

**Architecture:** Modify existing page components and widgets in the FSD structure. No new entities or API changes needed -- only UI/layout changes. Add one new e2e spec for the home page.

**Tech Stack:** React 19, Mantine 9, TypeScript 5.9, Playwright (e2e)

---

### Task 1: Redesign Home Page

**Files:**

- Modify: `frontend/src/pages/home/HomePage.tsx` (full rewrite)

The design shows a two-column hero layout:

- Left side: badge "БЫСТРАЯ ЗАПИСЬ НА ЗВОНОК", large title "Calendar", subtitle text, single orange "Записаться ->" CTA button
- Right side: "Возможности" card with bullet list
- No HostProfile, no icon cards, no "Админ-панель" button on the hero
- Light blue gradient background on the left half

- [ ] **Step 1: Rewrite HomePage.tsx**

Replace the entire content of `frontend/src/pages/home/HomePage.tsx` with:

```tsx
import {
  Container,
  Grid,
  Stack,
  Title,
  Text,
  Button,
  Badge,
  Paper,
  List,
} from "@mantine/core";
import { IconArrowRight } from "@tabler/icons-react";
import { Link } from "react-router-dom";

export const HomePage = () => {
  return (
    <div
      style={{
        background:
          "linear-gradient(135deg, #EBF0FF 0%, #F8F9FA 50%, #FFF5F0 100%)",
        minHeight: "calc(100vh - 60px)",
      }}
    >
      <Container size="lg" py={80}>
        <Grid gutter={60} align="center">
          <Grid.Col span={{ base: 12, md: 6 }}>
            <Stack gap="lg">
              <Badge
                variant="outline"
                color="dark"
                size="lg"
                radius="sm"
                style={{ alignSelf: "flex-start" }}
              >
                БЫСТРАЯ ЗАПИСЬ НА ЗВОНОК
              </Badge>

              <Title order={1} fz={48} lh={1.1}>
                Calendar
              </Title>

              <Text c="dimmed" size="lg" maw={480}>
                Забронируйте встречу за минуту: выберите тип события и удобное
                время.
              </Text>

              <Button
                component={Link}
                to="/booking"
                size="lg"
                radius="xl"
                rightSection={<IconArrowRight size={18} />}
                style={{ alignSelf: "flex-start" }}
              >
                Записаться
              </Button>
            </Stack>
          </Grid.Col>

          <Grid.Col span={{ base: 12, md: 6 }}>
            <Paper
              withBorder
              p="xl"
              radius="lg"
              shadow="sm"
              style={{ backgroundColor: "rgba(255,255,255,0.85)" }}
            >
              <Stack gap="md">
                <Title order={3}>Возможности</Title>
                <List spacing="md" size="md" c="dimmed">
                  <List.Item>
                    Выбор типа события и удобного времени для встречи.
                  </List.Item>
                  <List.Item>
                    Быстрое бронирование с подтверждением и дополнительными
                    заметками.
                  </List.Item>
                  <List.Item>
                    Управление типами встреч и просмотр предстоящих записей в
                    админке.
                  </List.Item>
                </List>
              </Stack>
            </Paper>
          </Grid.Col>
        </Grid>
      </Container>
    </div>
  );
};
```

- [ ] **Step 2: Verify visually**

Run: open `http://localhost:5173/` in the browser and compare with `design/01-home.png`.

Expected: Two-column layout with badge, "Calendar" title, subtitle, orange CTA on left; "Возможности" card with bullet list on right.

- [ ] **Step 3: Verify build**

Run: `cd frontend && yarn build`
Expected: No errors.

---

### Task 2: Redesign Booking Catalog Page

**Files:**

- Modify: `frontend/src/pages/booking/BookingCatalogPage.tsx`

Design shows:

- HostProfile is inside a centered bordered card at the top
- Title is "Выберите тип события" (not "встречи")
- Subtitle: "Нажмите на карточку, чтобы открыть календарь и выбрать удобный слот."
- Event type cards shown in a 2-column grid below the card

- [ ] **Step 1: Rewrite BookingCatalogPage.tsx**

Replace the entire content of `frontend/src/pages/booking/BookingCatalogPage.tsx` with:

```tsx
import {
  Container,
  Stack,
  Title,
  Text,
  SimpleGrid,
  Loader,
  Center,
  Alert,
  Paper,
} from "@mantine/core";
import { IconAlertCircle } from "@tabler/icons-react";
import { useNavigate } from "react-router-dom";
import { useEventTypes } from "@/entities/event-type/queries";
import { EventTypeCard } from "@/widgets/event-type-card";
import { HostProfile } from "@/widgets/host-profile";

export const BookingCatalogPage = () => {
  const navigate = useNavigate();
  const { data: eventTypes, isLoading, isError, error } = useEventTypes();

  return (
    <Container size="md" py="xl">
      <Stack gap="xl">
        <Paper withBorder p="xl" radius="lg">
          <Stack gap="md">
            <HostProfile />
            <Stack gap={4}>
              <Title order={2}>Выберите тип события</Title>
              <Text c="dimmed">
                Нажмите на карточку, чтобы открыть календарь и выбрать удобный
                слот.
              </Text>
            </Stack>
          </Stack>
        </Paper>

        {isLoading && (
          <Center py="xl">
            <Loader />
          </Center>
        )}

        {isError && (
          <Alert
            color="red"
            icon={<IconAlertCircle size={16} />}
            radius="sm"
            title="Ошибка загрузки"
          >
            {error instanceof Error
              ? error.message
              : "Не удалось загрузить типы встреч"}
          </Alert>
        )}

        {eventTypes && eventTypes.length === 0 && (
          <Text c="dimmed" ta="center" py="xl">
            Пока нет доступных типов встреч.
          </Text>
        )}

        {eventTypes && eventTypes.length > 0 && (
          <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="lg">
            {eventTypes.map((eventType) => (
              <EventTypeCard
                key={eventType.id}
                eventType={eventType}
                onClick={() => navigate(`/booking/${eventType.id}`)}
              />
            ))}
          </SimpleGrid>
        )}
      </Stack>
    </Container>
  );
};
```

- [ ] **Step 2: Update e2e test for catalog heading**

In `frontend/e2e/guest-catalog.spec.ts`, the test asserts `Выберите тип встречи`. We changed the heading to `Выберите тип события`. Update line 31:

Old: `await expect(page.getByRole('heading', { name: 'Выберите тип встречи' })).toBeVisible();`
New: `await expect(page.getByRole('heading', { name: 'Выберите тип события' })).toBeVisible();`

- [ ] **Step 3: Verify visually**

Run: open `http://localhost:5173/booking` in the browser and compare with `design/02-book-catalog.png`.

Expected: HostProfile inside bordered card, "Выберите тип события" heading, new subtitle, 2-column card grid.

- [ ] **Step 4: Verify build**

Run: `cd frontend && yarn build`
Expected: No errors.

---

### Task 3: Redesign Booking Slots Page (3-column layout + info panel)

**Files:**

- Modify: `frontend/src/pages/booking/BookingSlotsPage.tsx`

Design shows:

- Large page title at the top: event name (e.g., "Встреча 15 минут")
- 3-column layout below:
  - Left: Card with HostProfile, event info (name + badge + description), "Выбранная дата" block, "Выбранное время" block
  - Center: Calendar widget
  - Right: SlotsList widget with "Назад" and "Продолжить" buttons at the bottom

- [ ] **Step 1: Rewrite BookingSlotsPage.tsx**

Replace the entire content of `frontend/src/pages/booking/BookingSlotsPage.tsx` with:

```tsx
import {
  Container,
  Stack,
  Title,
  Text,
  Grid,
  Loader,
  Center,
  Alert,
  Button,
  Group,
  Paper,
  Badge,
  Box,
} from "@mantine/core";
import { IconAlertCircle, IconArrowLeft } from "@tabler/icons-react";
import { useState, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { format } from "date-fns";
import { ru } from "date-fns/locale";
import { notifications } from "@mantine/notifications";
import { useEventType } from "@/entities/event-type/queries";
import { useSlots } from "@/entities/slot/queries";
import { useCreateBooking } from "@/entities/booking/queries";
import { Calendar } from "@/widgets/calendar";
import { SlotsList } from "@/widgets/slots-list";
import { HostProfile } from "@/widgets/host-profile";
import { BookingModal } from "@/features/create-booking";
import type { Slot } from "@/entities/slot/model";
import type { BookingCreate } from "@/entities/booking/model";

export const BookingSlotsPage = () => {
  const { eventTypeId = "" } = useParams<{ eventTypeId: string }>();
  const navigate = useNavigate();

  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());
  const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null);
  const [modalOpened, setModalOpened] = useState(false);

  const dateParam = useMemo(
    () => format(selectedDate, "yyyy-MM-dd"),
    [selectedDate],
  );

  const { data: eventType, isLoading: isEventTypeLoading } =
    useEventType(eventTypeId);
  const {
    data: slots,
    isLoading: isSlotsLoading,
    isError: isSlotsError,
  } = useSlots(eventTypeId, dateParam);

  const createBooking = useCreateBooking();

  const handleSelectSlot = (slot: Slot) => {
    setSelectedSlot(slot);
    setModalOpened(true);
  };

  const handleCloseModal = () => {
    setModalOpened(false);
    setSelectedSlot(null);
  };

  const handleSubmitBooking = (data: BookingCreate) => {
    createBooking.mutate(data, {
      onSuccess: () => {
        notifications.show({
          title: "Запись создана",
          message: "Мы отправили подтверждение на ваш email",
          color: "green",
        });
        handleCloseModal();
      },
      onError: (err) => {
        notifications.show({
          title: "Ошибка",
          message:
            err instanceof Error ? err.message : "Не удалось создать запись",
          color: "red",
        });
      },
    });
  };

  const formatSelectedDate = () => {
    return format(selectedDate, "EEEE, d MMMM", { locale: ru });
  };

  const formatSelectedTime = () => {
    if (!selectedSlot) return "Время не выбрано";
    const start = new Date(selectedSlot.startTime);
    return start.toLocaleTimeString("ru-RU", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (isEventTypeLoading) {
    return (
      <Center py="xl">
        <Loader />
      </Center>
    );
  }

  if (!eventType) {
    return (
      <Container size="lg" py="xl">
        <Alert
          color="red"
          icon={<IconAlertCircle size={16} />}
          radius="sm"
          title="Тип встречи не найден"
        >
          <Stack gap="md">
            <Text>Возможно, ссылка устарела.</Text>
            <Button
              variant="light"
              leftSection={<IconArrowLeft size={16} />}
              onClick={() => navigate("/booking")}
              w="fit-content"
            >
              К списку встреч
            </Button>
          </Stack>
        </Alert>
      </Container>
    );
  }

  return (
    <Container size="lg" py="xl">
      <Stack gap="xl">
        <Title order={2}>{eventType.name}</Title>

        <Grid gutter="lg">
          <Grid.Col span={{ base: 12, md: 3 }}>
            <Paper withBorder p="lg" radius="lg">
              <Stack gap="md">
                <HostProfile />

                <Stack gap={4}>
                  <Group gap="xs" align="center">
                    <Text fw={600} size="md">
                      {eventType.name}
                    </Text>
                    <Badge variant="light" color="gray" radius="sm" size="sm">
                      {eventType.duration} мин
                    </Badge>
                  </Group>
                  <Text c="dimmed" size="sm">
                    {eventType.description}
                  </Text>
                </Stack>

                <Box
                  p="sm"
                  style={{
                    backgroundColor: "#FFF5F0",
                    borderRadius: "8px",
                  }}
                >
                  <Text size="xs" c="dimmed">
                    Выбранная дата
                  </Text>
                  <Text size="sm" fw={500}>
                    {formatSelectedDate()}
                  </Text>
                </Box>

                <Box
                  p="sm"
                  style={{
                    backgroundColor: "#FFF5F0",
                    borderRadius: "8px",
                  }}
                >
                  <Text size="xs" c="dimmed">
                    Выбранное время
                  </Text>
                  <Text size="sm" fw={500}>
                    {formatSelectedTime()}
                  </Text>
                </Box>
              </Stack>
            </Paper>
          </Grid.Col>

          <Grid.Col span={{ base: 12, md: 5 }}>
            <Calendar
              selectedDate={selectedDate}
              onSelectDate={setSelectedDate}
              currentMonth={currentMonth}
              onMonthChange={setCurrentMonth}
            />
          </Grid.Col>

          <Grid.Col span={{ base: 12, md: 4 }}>
            {isSlotsLoading ? (
              <Center py="xl">
                <Loader />
              </Center>
            ) : isSlotsError ? (
              <Alert
                color="red"
                icon={<IconAlertCircle size={16} />}
                radius="sm"
              >
                Не удалось загрузить слоты
              </Alert>
            ) : (
              <SlotsList
                slots={slots ?? []}
                selectedSlot={selectedSlot}
                onSelectSlot={handleSelectSlot}
              />
            )}

            <Group justify="space-between" mt="md">
              <Button
                variant="default"
                radius="xl"
                onClick={() => navigate("/booking")}
              >
                Назад
              </Button>
              <Button
                radius="xl"
                disabled={!selectedSlot}
                onClick={() => selectedSlot && handleSelectSlot(selectedSlot)}
              >
                Продолжить
              </Button>
            </Group>
          </Grid.Col>
        </Grid>
      </Stack>

      <BookingModal
        opened={modalOpened}
        onClose={handleCloseModal}
        slot={selectedSlot}
        eventType={eventType}
        onSubmit={handleSubmitBooking}
        isSubmitting={createBooking.isPending}
      />
    </Container>
  );
};
```

- [ ] **Step 2: Verify visually**

Run: open `http://localhost:5173/booking/<some-id>` in the browser and compare with `design/03-book-event-type.png`.

Expected: 3-column layout. Left: info panel with host profile, event details, selected date/time. Center: calendar. Right: slots + navigation buttons.

- [ ] **Step 3: Verify build**

Run: `cd frontend && yarn build`
Expected: No errors.

---

### Task 4: Add free slot counts to Calendar days

**Files:**

- Modify: `frontend/src/widgets/calendar/Calendar.tsx`

In the design, calendar days in the booking window show the number of free slots (e.g., "33 св.", "35 св.") below the day number. This requires the Calendar widget to accept and display slot count data.

- [ ] **Step 1: Update Calendar props and rendering**

Add an optional `slotCounts` prop to Calendar:

```tsx
interface CalendarProps {
  selectedDate: Date;
  onSelectDate: (date: Date) => void;
  onMonthChange: (date: Date) => void;
  currentMonth: Date;
  slotCounts?: Record<string, number>;
}
```

Update the day rendering inside the `.map()` to show the count below the day number when a count > 0 exists:

In the `Calendar` component, destructure the new prop:

```tsx
export const Calendar = ({
  selectedDate,
  onSelectDate,
  onMonthChange,
  currentMonth,
  slotCounts,
}: CalendarProps) => {
```

In the day cell, after the day number text, add:

```tsx
<Box
  onClick={() => onSelectDate(day)}
  style={{
    aspectRatio: "1",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    borderRadius: "8px",
    backgroundColor: isSelected ? "#F56A1C" : "transparent",
    color: isSelected ? "#fff" : isCurrentMonth ? "#212529" : "#ADB5BD",
    fontWeight: isSelected ? 600 : 400,
  }}
>
  <Text size="sm">{format(day, "d")}</Text>
  {slotCounts &&
    isCurrentMonth &&
    (() => {
      const key = format(day, "yyyy-MM-dd");
      const count = slotCounts[key];
      return count && count > 0 ? (
        <Text size="xs" c={isSelected ? "white" : "dimmed"} lh={1}>
          {count} св.
        </Text>
      ) : null;
    })()}
</Box>
```

- [ ] **Step 2: Verify build**

Run: `cd frontend && yarn build`
Expected: No errors. The `slotCounts` prop is optional, so existing usage in `BookingSlotsPage` still works without passing it.

---

### Task 5: Add e2e test for Home page

**Files:**

- Create: `frontend/e2e/home.spec.ts`

- [ ] **Step 1: Write the home page e2e test**

Create `frontend/e2e/home.spec.ts`:

```ts
import { test, expect } from "@playwright/test";

test.describe("Главная страница", () => {
  test("отображает hero-секцию с заголовком, описанием и кнопкой", async ({
    page,
  }) => {
    await page.goto("/");

    await expect(page.getByText("БЫСТРАЯ ЗАПИСЬ НА ЗВОНОК")).toBeVisible();

    await expect(page.getByRole("heading", { name: "Calendar" })).toBeVisible();

    await expect(
      page.getByText(
        "Забронируйте встречу за минуту: выберите тип события и удобное время.",
      ),
    ).toBeVisible();

    const ctaButton = page.getByRole("link", { name: "Записаться" });
    await expect(ctaButton).toBeVisible();
    await expect(ctaButton).toHaveAttribute("href", "/booking");
  });

  test("отображает карточку возможностей", async ({ page }) => {
    await page.goto("/");

    await expect(
      page.getByRole("heading", { name: "Возможности" }),
    ).toBeVisible();

    await expect(
      page.getByText("Выбор типа события и удобного времени для встречи."),
    ).toBeVisible();
    await expect(
      page.getByText(
        "Быстрое бронирование с подтверждением и дополнительными заметками.",
      ),
    ).toBeVisible();
    await expect(
      page.getByText(
        "Управление типами встреч и просмотр предстоящих записей в админке.",
      ),
    ).toBeVisible();
  });

  test('кнопка "Записаться" ведёт на каталог', async ({ page }) => {
    await page.goto("/");

    await page.getByRole("link", { name: "Записаться" }).click();

    await expect(page).toHaveURL(/\/booking$/);
  });
});
```

- [ ] **Step 2: Run the home e2e test**

Run: `cd frontend && npx playwright test e2e/home.spec.ts`
Expected: All 3 tests pass.

---

### Task 6: Run all existing e2e tests to verify no regressions

**Files:** None (verification only)

- [ ] **Step 1: Run all e2e tests**

Run: `cd frontend && npx playwright test`
Expected: All tests pass. If any test fails, fix the issue before proceeding.

- [ ] **Step 2: Run the build**

Run: `cd frontend && yarn build`
Expected: No errors.

---
