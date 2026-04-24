import { Card, Group, Text, Stack, Box } from '@mantine/core';
import type { Slot } from '@/entities/slot/model';

interface SlotsListProps {
  slots: Slot[];
  selectedSlot: Slot | null;
  onSelectSlot: (slot: Slot) => void;
}

export const SlotsList = ({ slots, selectedSlot, onSelectSlot }: SlotsListProps) => {
  const formatTime = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <Card withBorder padding="lg" radius="lg" h="100%">
      <Stack gap="md">
        <Text fw={600} size="lg">
          Статус слотов
        </Text>

        <Stack gap="xs">
          {slots.map((slot, index) => {
            const isFree = slot.status === 'free';
            const isSelected = selectedSlot?.startTime === slot.startTime;

            return (
              <Group
                key={index}
                justify="space-between"
                p="sm"
                style={{
                  borderRadius: '8px',
                  backgroundColor: isSelected ? '#FFF5F0' : '#F8F9FA',
                  border: isSelected ? '1px solid #F56A1C' : '1px solid transparent',
                  cursor: isFree ? 'pointer' : 'default',
                }}
                onClick={() => isFree && onSelectSlot(slot)}
              >
                <Text size="sm" c={isFree ? 'dark' : 'dimmed'}>
                  {formatTime(slot.startTime)} - {formatTime(slot.endTime)}
                </Text>
                <Text size="sm" c={isFree ? 'dark' : 'dimmed'} fw={isFree ? 500 : 400}>
                  {isFree ? 'Свободно' : 'Занято'}
                </Text>
              </Group>
            );
          })}

          {slots.length === 0 && (
            <Box py="xl">
              <Text c="dimmed" ta="center" size="sm">
                Нет доступных слотов на выбранную дату
              </Text>
            </Box>
          )}
        </Stack>
      </Stack>
    </Card>
  );
};
