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
} from '@mantine/core';
import { IconAlertCircle } from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';
import { useEventTypes } from '@/entities/event-type/queries';
import { EventTypeCard } from '@/widgets/event-type-card';
import { HostProfile } from '@/widgets/host-profile';

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
                Нажмите на карточку, чтобы открыть календарь и выбрать удобный слот.
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
            radius="md"
            title="Ошибка загрузки"
          >
            {error instanceof Error ? error.message : 'Не удалось загрузить типы встреч'}
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
