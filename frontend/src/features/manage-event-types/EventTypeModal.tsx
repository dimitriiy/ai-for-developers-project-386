import {
  Modal,
  Stack,
  TextInput,
  Textarea,
  NumberInput,
  Button,
  Group,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { useEffect } from 'react';
import type {
  EventType,
  EventTypeCreate,
  EventTypeUpdate,
} from '@/shared/api/types';

interface EventTypeModalProps {
  opened: boolean;
  onClose: () => void;
  eventType?: EventType | null;
  onSubmit: (data: EventTypeCreate | EventTypeUpdate) => void;
  isSubmitting?: boolean;
}

interface EventTypeFormValues {
  name: string;
  description: string;
  duration: number;
}

const DEFAULT_VALUES: EventTypeFormValues = {
  name: '',
  description: '',
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
    mode: 'uncontrolled',
    initialValues: DEFAULT_VALUES,
    validate: {
      name: (value) => {
        if (value.trim().length === 0) return 'Название обязательно';
        if (value.length > 100) return 'Максимум 100 символов';
        return null;
      },
      description: (value) => {
        if (value.trim().length === 0) return 'Описание обязательно';
        if (value.length > 500) return 'Максимум 500 символов';
        return null;
      },
      duration: (value) => {
        if (!value || value < 5) return 'Минимум 5 минут';
        if (value > 480) return 'Максимум 480 минут';
        return null;
      },
    },
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
      title={isEditMode ? 'Редактировать тип события' : 'Создать тип события'}
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
            radius="md"
            key={form.key('name')}
            {...form.getInputProps('name')}
          />
          <Textarea
            label="Описание"
            placeholder="Краткое описание"
            required
            radius="md"
            minRows={3}
            autosize
            key={form.key('description')}
            {...form.getInputProps('description')}
          />
          <NumberInput
            label="Длительность (минут)"
            required
            radius="md"
            min={5}
            max={480}
            step={5}
            key={form.key('duration')}
            {...form.getInputProps('duration')}
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
              {isEditMode ? 'Сохранить' : 'Создать'}
            </Button>
          </Group>
        </Stack>
      </form>
    </Modal>
  );
};
