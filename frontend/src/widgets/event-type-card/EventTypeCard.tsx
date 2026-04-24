import { Card, Group, Text, Badge } from '@mantine/core';
import type { EventType } from '@/entities/event-type/model';

interface EventTypeCardProps {
  eventType: EventType;
  onClick?: () => void;
}

export const EventTypeCard = ({ eventType, onClick }: EventTypeCardProps) => {
  return (
    <Card
      withBorder
      padding="lg"
      radius="lg"
      style={{ cursor: onClick ? 'pointer' : 'default' }}
      onClick={onClick}
    >
      <Group justify="space-between" align="flex-start">
        <Text fw={600} size="md">
          {eventType.name}
        </Text>
        <Badge variant="light" color="gray" radius="sm">
          {eventType.duration} мин
        </Badge>
      </Group>
      <Text c="dimmed" size="sm" mt="xs">
        {eventType.description}
      </Text>
    </Card>
  );
};
