import {
  Card,
  Group,
  Text,
  Stack,
  Box,
  Loader,
  Center,
  Alert,
  ScrollArea,
} from "@mantine/core";
import { IconAlertCircle } from "@tabler/icons-react";
import type { Slot } from "@/entities/slot/model";

interface SlotsListProps {
  slots: Slot[];
  selectedSlot: Slot | null;
  onSelectSlot: (slot: Slot) => void;
  isLoading?: boolean;
  isError?: boolean;
}

export const SlotsList = ({
  slots,
  selectedSlot,
  onSelectSlot,
  isLoading,
  isError,
}: SlotsListProps) => {
  const formatTime = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleTimeString("ru-RU", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <Card withBorder padding="lg" radius="lg" h="100%">
      <Stack gap="md" h="100%">
        <Text fw={600} size="lg">
          Статус слотов
        </Text>

        {isLoading ? (
          <Center py="xl" style={{ flex: 1 }}>
            <Loader />
          </Center>
        ) : isError ? (
          <Alert color="red" icon={<IconAlertCircle size={16} />} radius="sm">
            Не удалось загрузить слоты
          </Alert>
        ) : (
          <ScrollArea.Autosize mah={400} offsetScrollbars>
            <Stack gap="xs">
              {slots.map((slot, index) => {
                const isFree = slot.status === "free";
                const isSelected = selectedSlot?.startTime === slot.startTime;

                return (
                    <Group
                    key={index}
                    justify="space-between"
                    p="sm"
                    style={{
                      borderRadius: "8px",
                      backgroundColor: isSelected ? "#FFF5F0" : (isFree ? "#fff" : "#f2f6fa"),
                      border: isSelected
                        ? "1px solid #F56A1C"
                        : "1px solid #e9ecef",
                      cursor: isFree ? "pointer" : "default",
                    }}
                    onClick={() => isFree && onSelectSlot(slot)}
                  >
                    <Text size="sm" c={isFree ? "dark" : "dimmed"}>
                      {formatTime(slot.startTime)} - {formatTime(slot.endTime)}
                    </Text>
                    <Text
                      size="sm"
                      c={isFree ? "dark" : "dimmed"}
                      fw={isFree ? 500 : 400}
                    >
                      {isFree ? "Свободно" : "Занято"}
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
          </ScrollArea.Autosize>
        )}
      </Stack>
    </Card>
  );
};
