import {
  Modal,
  Stack,
  TextInput,
  Textarea,
  NumberInput,
  Button,
  Group,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { useEffect } from "react";
import type {
  EventType,
  EventTypeCreate,
  EventTypeUpdate,
} from "@/shared/api/types";
import { eventTypeValidation, type EventTypeFormValues } from "./validation";

interface EventTypeModalProps {
  opened: boolean;
  onClose: () => void;
  eventType?: EventType | null;
  onSubmit: (data: EventTypeCreate | EventTypeUpdate) => void;
  isSubmitting?: boolean;
}

const DEFAULT_VALUES: EventTypeFormValues = {
  name: "",
  description: "",
  duration: 30,
};

export const EventTypeModal = ({
  opened,
  onClose,
  eventType,
  onSubmit,
  isSubmitting = false,
}: EventTypeModalProps) => {
  const isEditMode = Boolean(eventType);

  const form = useForm<EventTypeFormValues>({
    mode: "uncontrolled",
    initialValues: DEFAULT_VALUES,
    validate: eventTypeValidation,
  });

  useEffect(() => {
    if (opened) {
      form.setValues(
        eventType
          ? {
              name: eventType.name,
              description: eventType.description,
              duration: eventType.duration,
            }
          : DEFAULT_VALUES,
      );
      form.resetDirty();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [opened, eventType]);

  const handleSubmit = (values: EventTypeFormValues) => {
    onSubmit({
      name: values.name.trim(),
      description: values.description.trim(),
      duration: values.duration,
    });
  };

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={isEditMode ? "Редактировать тип события" : "Создать тип события"}
      centered
      radius="lg"
      size="md"
    >
      <form onSubmit={form.onSubmit(handleSubmit)}>
        <Stack gap="md">
          <TextInput
            label="Название"
            placeholder="Встреча 30 минут"
            required
            radius="sm"
            key={form.key("name")}
            {...form.getInputProps("name")}
          />
          <Textarea
            label="Описание"
            placeholder="Краткое описание"
            required
            radius="sm"
            minRows={3}
            autosize
            key={form.key("description")}
            {...form.getInputProps("description")}
          />
          <NumberInput
            label="Длительность (минут)"
            required
            radius="sm"
            min={5}
            max={480}
            step={5}
            key={form.key("duration")}
            {...form.getInputProps("duration")}
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
            <Button type="submit" loading={isSubmitting}>
              {isEditMode ? "Сохранить" : "Создать"}
            </Button>
          </Group>
        </Stack>
      </form>
    </Modal>
  );
};
