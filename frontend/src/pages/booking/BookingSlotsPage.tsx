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
} from '@mantine/core';
import { IconAlertCircle, IconArrowLeft } from '@tabler/icons-react';
import { useState, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { format } from 'date-fns';
import { notifications } from '@mantine/notifications';
import { useEventType } from '@/entities/event-type/queries';
import { useSlots } from '@/entities/slot/queries';
import { useCreateBooking } from '@/entities/booking/queries';
import { Calendar } from '@/widgets/calendar';
import { SlotsList } from '@/widgets/slots-list';
import { HostProfile } from '@/widgets/host-profile';
import { BookingModal } from '@/features/create-booking';
import type { Slot } from '@/entities/slot/model';
import type { BookingCreate } from '@/entities/booking/model';

export const BookingSlotsPage = () => {
  const { eventTypeId = '' } = useParams<{ eventTypeId: string }>();
  const navigate = useNavigate();

  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());
  const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null);
  const [modalOpened, setModalOpened] = useState(false);

  const dateParam = useMemo(
    () => format(selectedDate, 'yyyy-MM-dd'),
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
          title: 'Запись создана',
          message: 'Мы отправили подтверждение на ваш email',
          color: 'green',
        });
        handleCloseModal();
      },
      onError: (err) => {
        notifications.show({
          title: 'Ошибка',
          message: err instanceof Error ? err.message : 'Не удалось создать запись',
          color: 'red',
        });
      },
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
          radius="md"
          title="Тип встречи не найден"
        >
          <Stack gap="md">
            <Text>Возможно, ссылка устарела.</Text>
            <Button
              variant="light"
              leftSection={<IconArrowLeft size={16} />}
              onClick={() => navigate('/booking')}
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
        <Stack gap="md">
          <Group>
            <Button
              variant="subtle"
              color="gray"
              leftSection={<IconArrowLeft size={16} />}
              onClick={() => navigate('/booking')}
            >
              Назад
            </Button>
          </Group>
          <HostProfile />
          <Stack gap={4}>
            <Title order={2}>{eventType.name}</Title>
            <Text c="dimmed">
              {eventType.description} · {eventType.duration} мин
            </Text>
          </Stack>
        </Stack>

        <Grid gap="lg">
          <Grid.Col span={{ base: 12, md: 7 }}>
            <Calendar
              selectedDate={selectedDate}
              onSelectDate={setSelectedDate}
              currentMonth={currentMonth}
              onMonthChange={setCurrentMonth}
            />
          </Grid.Col>
          <Grid.Col span={{ base: 12, md: 5 }}>
            {isSlotsLoading ? (
              <Center py="xl">
                <Loader />
              </Center>
            ) : isSlotsError ? (
              <Alert
                color="red"
                icon={<IconAlertCircle size={16} />}
                radius="md"
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
