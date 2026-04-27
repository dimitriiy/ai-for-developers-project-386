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
import { format, addDays, startOfDay, isAfter } from "date-fns";
import { ru } from "date-fns/locale";
import { notifications } from "@mantine/notifications";
import { useEventType } from "@/entities/event-type/queries";
import { useSlots, useSlotCounts } from "@/entities/slot/queries";
import { useCreateBooking } from "@/entities/booking/queries";
import { Calendar } from "@/widgets/calendar";
import { SlotsList } from "@/widgets/slots-list";
import { HostProfile } from "@/widgets/host-profile";
import { BookingModal } from "@/features/create-booking";
import { generateDaySlots } from "@/shared/lib";
import type { Slot } from "@/entities/slot/model";
import type { BookingCreate } from "@/entities/booking/model";
import classes from "./BookingSlotsPage.module.css";

const BOOKING_WINDOW_DAYS = 14;

export const BookingSlotsPage = () => {
  const { eventTypeId = "" } = useParams<{ eventTypeId: string }>();
  const navigate = useNavigate();

  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());
  const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null);
  const [modalOpened, setModalOpened] = useState(false);

  const isDateAvailable = (date: Date): boolean => {
    const today = startOfDay(new Date());
    const maxDate = addDays(today, BOOKING_WINDOW_DAYS);
    return !isAfter(date, maxDate);
  };

  const dateParam = useMemo(
    () => format(selectedDate, "yyyy-MM-dd"),
    [selectedDate],
  );

  const { data: eventType, isLoading: isEventTypeLoading } =
    useEventType(eventTypeId);
  const {
    data: apiSlots,
    isLoading: isSlotsLoading,
    isError: isSlotsError,
  } = useSlots(eventTypeId, dateParam);

  const duration = eventType?.duration ?? 30;

  const { slotCounts } = useSlotCounts(eventTypeId, duration);

  const slots = useMemo(() => {
    if (isSlotsLoading) return [];
    return generateDaySlots(dateParam, duration, apiSlots ?? []);
  }, [dateParam, duration, apiSlots, isSlotsLoading]);

  const createBooking = useCreateBooking();

  const handleSelectDate = (date: Date) => {
    if (isDateAvailable(date)) {
      setSelectedDate(date);
    } else {
      notifications.show({
        title: "Недоступная дата",
        message: `Запись доступна только на ближайшие ${BOOKING_WINDOW_DAYS} дней`,
        color: "orange",
      });
    }
  };

  const handleSelectSlot = (slot: Slot) => {
    setSelectedSlot(slot);
  };

  const handleContinue = () => {
    if (selectedSlot) {
      setModalOpened(true);
    }
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

        <Grid gap="lg">
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

                <Box p="sm" className={classes.infoBox}>
                  <Text size="xs" c="dimmed">
                    Выбранная дата
                  </Text>
                  <Text size="sm" fw={500}>
                    {formatSelectedDate()}
                  </Text>
                </Box>

                <Box p="sm" className={classes.infoBox}>
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
              onSelectDate={handleSelectDate}
              currentMonth={currentMonth}
              onMonthChange={setCurrentMonth}
              slotCounts={slotCounts}
            />
          </Grid.Col>

          <Grid.Col span={{ base: 12, md: 4 }}>
            <SlotsList
              slots={slots}
              selectedSlot={selectedSlot}
              onSelectSlot={handleSelectSlot}
              isLoading={isSlotsLoading}
              isError={isSlotsError}
            />

            <Group justify="space-between" mt="md">
              <Button
                variant="default"
                radius="sm"
                onClick={() => navigate("/booking")}
              >
                Назад
              </Button>
              <Button
                radius="sm"
                disabled={!selectedSlot}
                onClick={handleContinue}
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
