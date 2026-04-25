import {
  Container,
  Stack,
  Title,
  Text,
  Tabs,
  Button,
  Group,
  Table,
  ActionIcon,
  Loader,
  Center,
  Alert,
  Badge,
  Paper,
} from "@mantine/core";
import {
  IconAlertCircle,
  IconCalendarEvent,
  IconClipboardList,
  IconEdit,
  IconPlus,
  IconTrash,
} from "@tabler/icons-react";
import { useState } from "react";
import { modals } from "@mantine/modals";
import { notifications } from "@mantine/notifications";
import { format } from "date-fns";
import { ru } from "date-fns/locale";
import {
  EventTypeModal,
  useAdminEventTypes,
  useCreateEventType,
  useUpdateEventType,
  useDeleteEventType,
} from "@/features/manage-event-types";
import { useAdminBookings } from "@/entities/booking/queries";
import type {
  EventType,
  EventTypeCreate,
  EventTypeUpdate,
} from "@/shared/api/types";

export const AdminPage = () => {
  const [modalOpened, setModalOpened] = useState(false);
  const [editingType, setEditingType] = useState<EventType | null>(null);

  const eventTypesQuery = useAdminEventTypes();
  const bookingsQuery = useAdminBookings();
  const createMutation = useCreateEventType();
  const updateMutation = useUpdateEventType();
  const deleteMutation = useDeleteEventType();

  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  const handleOpenCreate = () => {
    setEditingType(null);
    setModalOpened(true);
  };

  const handleOpenEdit = (eventType: EventType) => {
    setEditingType(eventType);
    setModalOpened(true);
  };

  const handleCloseModal = () => {
    setModalOpened(false);
    setEditingType(null);
  };

  const handleSubmit = (data: EventTypeCreate | EventTypeUpdate) => {
    const onSuccess = () => {
      notifications.show({
        title: editingType ? "Тип обновлён" : "Тип создан",
        message: "Изменения сохранены",
        color: "green",
      });
      handleCloseModal();
    };
    const onError = (err: unknown) => {
      notifications.show({
        title: "Ошибка",
        message: err instanceof Error ? err.message : "Не удалось сохранить",
        color: "red",
      });
    };

    if (editingType) {
      updateMutation.mutate(
        { id: editingType.id, data: data as EventTypeUpdate },
        { onSuccess, onError },
      );
    } else {
      createMutation.mutate(data as EventTypeCreate, { onSuccess, onError });
    }
  };

  const handleDelete = (eventType: EventType) => {
    modals.openConfirmModal({
      title: "Удалить тип события?",
      centered: true,
      children: (
        <Text size="sm">
          Тип «{eventType.name}» будет удалён. Это действие нельзя отменить.
        </Text>
      ),
      labels: { confirm: "Удалить", cancel: "Отмена" },
      confirmProps: { color: "red" },
      onConfirm: () => {
        deleteMutation.mutate(eventType.id, {
          onSuccess: () =>
            notifications.show({
              title: "Удалено",
              message: `Тип «${eventType.name}» удалён`,
              color: "green",
            }),
          onError: (err) =>
            notifications.show({
              title: "Ошибка",
              message:
                err instanceof Error ? err.message : "Не удалось удалить",
              color: "red",
            }),
        });
      },
    });
  };

  return (
    <Container size="lg" py="xl">
      <Stack gap="xl">
        <Stack gap={4}>
          <Title order={2}>Админ-панель</Title>
          <Text c="dimmed">Управление типами встреч и записями.</Text>
        </Stack>

        <Tabs defaultValue="event-types" radius="sm">
          <Tabs.List>
            <Tabs.Tab
              value="event-types"
              leftSection={<IconCalendarEvent size={16} />}
            >
              Типы встреч
            </Tabs.Tab>
            <Tabs.Tab
              value="bookings"
              leftSection={<IconClipboardList size={16} />}
            >
              Записи
            </Tabs.Tab>
          </Tabs.List>

          <Tabs.Panel value="event-types" pt="lg">
            <Stack gap="md">
              <Group justify="flex-end">
                <Button
                  leftSection={<IconPlus size={16} />}
                  onClick={handleOpenCreate}
                >
                  Добавить
                </Button>
              </Group>

              <Paper withBorder radius="lg" p={0}>
                {eventTypesQuery.isLoading ? (
                  <Center py="xl">
                    <Loader />
                  </Center>
                ) : eventTypesQuery.isError ? (
                  <Alert
                    color="red"
                    icon={<IconAlertCircle size={16} />}
                    m="md"
                    radius="sm"
                  >
                    Не удалось загрузить типы встреч
                  </Alert>
                ) : eventTypesQuery.data && eventTypesQuery.data.length > 0 ? (
                  <Table verticalSpacing="md" highlightOnHover>
                    <Table.Thead>
                      <Table.Tr>
                        <Table.Th>Название</Table.Th>
                        <Table.Th>Описание</Table.Th>
                        <Table.Th>Длительность</Table.Th>
                        <Table.Th w={120}>Действия</Table.Th>
                      </Table.Tr>
                    </Table.Thead>
                    <Table.Tbody>
                      {eventTypesQuery.data.map((eventType) => (
                        <Table.Tr key={eventType.id}>
                          <Table.Td>
                            <Text fw={500}>{eventType.name}</Text>
                          </Table.Td>
                          <Table.Td>
                            <Text c="dimmed" size="sm" lineClamp={2}>
                              {eventType.description}
                            </Text>
                          </Table.Td>
                          <Table.Td>
                            <Badge variant="light" color="gray" radius="sm">
                              {eventType.duration} мин
                            </Badge>
                          </Table.Td>
                          <Table.Td>
                            <Group gap="xs">
                              <ActionIcon
                                variant="subtle"
                                color="gray"
                                onClick={() => handleOpenEdit(eventType)}
                                aria-label="Редактировать"
                              >
                                <IconEdit size={16} />
                              </ActionIcon>
                              <ActionIcon
                                variant="subtle"
                                color="red"
                                onClick={() => handleDelete(eventType)}
                                aria-label="Удалить"
                                loading={
                                  deleteMutation.isPending &&
                                  deleteMutation.variables === eventType.id
                                }
                              >
                                <IconTrash size={16} />
                              </ActionIcon>
                            </Group>
                          </Table.Td>
                        </Table.Tr>
                      ))}
                    </Table.Tbody>
                  </Table>
                ) : (
                  <Text c="dimmed" ta="center" py="xl">
                    Нет типов встреч. Добавьте первый.
                  </Text>
                )}
              </Paper>
            </Stack>
          </Tabs.Panel>

          <Tabs.Panel value="bookings" pt="lg">
            <Paper withBorder radius="lg" p={0}>
              {bookingsQuery.isLoading ? (
                <Center py="xl">
                  <Loader />
                </Center>
              ) : bookingsQuery.isError ? (
                <Alert
                  color="red"
                  icon={<IconAlertCircle size={16} />}
                  m="md"
                  radius="sm"
                >
                  Не удалось загрузить записи
                </Alert>
              ) : bookingsQuery.data && bookingsQuery.data.length > 0 ? (
                <Table verticalSpacing="md" highlightOnHover>
                  <Table.Thead>
                    <Table.Tr>
                      <Table.Th>Гость</Table.Th>
                      <Table.Th>Email</Table.Th>
                      <Table.Th>Начало</Table.Th>
                      <Table.Th>Окончание</Table.Th>
                    </Table.Tr>
                  </Table.Thead>
                  <Table.Tbody>
                    {bookingsQuery.data.map((booking) => (
                      <Table.Tr key={booking.id}>
                        <Table.Td>
                          <Text fw={500}>{booking.guestName}</Text>
                        </Table.Td>
                        <Table.Td>
                          <Text c="dimmed" size="sm">
                            {booking.guestEmail}
                          </Text>
                        </Table.Td>
                        <Table.Td>
                          <Text size="sm">
                            {format(
                              new Date(booking.startTime),
                              "d MMM yyyy, HH:mm",
                              {
                                locale: ru,
                              },
                            )}
                          </Text>
                        </Table.Td>
                        <Table.Td>
                          <Text size="sm">
                            {format(new Date(booking.endTime), "HH:mm", {
                              locale: ru,
                            })}
                          </Text>
                        </Table.Td>
                      </Table.Tr>
                    ))}
                  </Table.Tbody>
                </Table>
              ) : (
                <Text c="dimmed" ta="center" py="xl">
                  Пока нет записей.
                </Text>
              )}
            </Paper>
          </Tabs.Panel>
        </Tabs>
      </Stack>

      <EventTypeModal
        opened={modalOpened}
        onClose={handleCloseModal}
        eventType={editingType}
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
      />
    </Container>
  );
};
