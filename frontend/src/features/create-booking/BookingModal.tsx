import {
  Modal,
  Stack,
  TextInput,
  Button,
  Group,
  Text,
  Divider,
  Box,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { useEffect } from "react";
import { format } from "date-fns";
import { ru } from "date-fns/locale";
import type { Slot } from "@/entities/slot/model";
import type { EventType } from "@/entities/event-type/model";
import type { BookingCreate } from "@/entities/booking/model";
import { bookingValidation, type BookingFormValues } from "./validation";
import classes from "./BookingModal.module.css";

interface BookingModalProps {
  opened: boolean;
  onClose: () => void;
  slot: Slot | null;
  eventType: EventType | null;
  onSubmit: (data: BookingCreate) => void;
  isSubmitting?: boolean;
}

export const BookingModal = ({
  opened,
  onClose,
  slot,
  eventType,
  onSubmit,
  isSubmitting = false,
}: BookingModalProps) => {
  const form = useForm<BookingFormValues>({
    mode: "uncontrolled",
    initialValues: {
      guestName: "",
      guestEmail: "",
    },
    validate: bookingValidation,
  });

  useEffect(() => {
    if (!opened) {
      form.reset();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [opened]);

  const handleSubmit = (values: BookingFormValues) => {
    if (!slot || !eventType) return;
    onSubmit({
      eventTypeId: eventType.id,
      guestName: values.guestName.trim(),
      guestEmail: values.guestEmail.trim(),
      startTime: slot.startTime,
    });
  };

  const formatDateTime = (iso: string) => {
    const date = new Date(iso);
    return format(date, "d MMMM yyyy, HH:mm", { locale: ru });
  };

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title="Подтверждение записи"
      centered
      radius="lg"
      size="md"
    >
      <Stack gap="md">
        {eventType && slot && (
          <Box p="md" className={classes.eventInfoBox}>
            <Stack gap="xs">
              <Text fw={600} size="md">
                {eventType.name}
              </Text>
              <Text size="sm" c="dimmed">
                {eventType.description}
              </Text>
              <Group gap="xs">
                <Text size="sm" fw={500}>
                  {formatDateTime(slot.startTime)}
                </Text>
                <Text size="sm" c="dimmed">
                  · {eventType.duration} мин
                </Text>
              </Group>
            </Stack>
          </Box>
        )}

        <Divider />

        <form onSubmit={form.onSubmit(handleSubmit)}>
          <Stack gap="md">
            <TextInput
              label="Ваше имя"
              placeholder="Иван Иванов"
              required
              radius="sm"
              key={form.key("guestName")}
              {...form.getInputProps("guestName")}
            />
            <TextInput
              label="Email"
              placeholder="ivan@example.com"
              required
              radius="sm"
              type="email"
              key={form.key("guestEmail")}
              {...form.getInputProps("guestEmail")}
            />

            <Group justify="flex-end" mt="sm">
              <Button
                variant="subtle"
                color="gray"
                onClick={onClose}
                disabled={isSubmitting}
              >
                Отмена
              </Button>
              <Button
                type="submit"
                loading={isSubmitting}
                disabled={!slot || !eventType}
              >
                Записаться
              </Button>
            </Group>
          </Stack>
        </form>
      </Stack>
    </Modal>
  );
};
