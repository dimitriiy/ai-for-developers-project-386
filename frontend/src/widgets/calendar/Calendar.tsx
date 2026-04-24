import {
  Box,
  Group,
  Button,
  Text,
  Grid,
  Stack,
  Paper,
} from '@mantine/core';
import { IconChevronLeft, IconChevronRight } from '@tabler/icons-react';
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  addMonths,
  subMonths,
  startOfWeek,
  endOfWeek,
} from 'date-fns';
import { ru } from 'date-fns/locale';

interface CalendarProps {
  selectedDate: Date;
  onSelectDate: (date: Date) => void;
  onMonthChange: (date: Date) => void;
  currentMonth: Date;
}

const weekDays = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];

export const Calendar = ({
  selectedDate,
  onSelectDate,
  onMonthChange,
  currentMonth,
}: CalendarProps) => {
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const calendarStart = startOfWeek(monthStart, { locale: ru, weekStartsOn: 1 });
  const calendarEnd = endOfWeek(monthEnd, { locale: ru, weekStartsOn: 1 });

  const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

  const handlePrevMonth = () => {
    onMonthChange(subMonths(currentMonth, 1));
  };

  const handleNextMonth = () => {
    onMonthChange(addMonths(currentMonth, 1));
  };

  return (
    <Paper withBorder p="lg" radius="lg">
      <Stack gap="md">
        <Group justify="space-between">
          <Text fw={600} size="lg">
            Календарь
          </Text>
          <Group gap="xs">
            <Button variant="subtle" size="compact-sm" onClick={handlePrevMonth}>
              <IconChevronLeft size={16} />
            </Button>
            <Button variant="subtle" size="compact-sm" onClick={handleNextMonth}>
              <IconChevronRight size={16} />
            </Button>
          </Group>
        </Group>

        <Text fw={500}>
          {format(currentMonth, 'LLLL yyyy', { locale: ru })}
        </Text>

        <Grid columns={7} gap="xs">
          {weekDays.map((day) => (
            <Grid.Col key={day} span={1}>
              <Text ta="center" size="sm" c="dimmed" fw={500}>
                {day}
              </Text>
            </Grid.Col>
          ))}

          {days.map((day) => {
            const isSelected = isSameDay(day, selectedDate);
            const isCurrentMonth = isSameMonth(day, currentMonth);

            return (
              <Grid.Col key={day.toISOString()} span={1}>
                <Box
                  onClick={() => onSelectDate(day)}
                  style={{
                    aspectRatio: '1',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    borderRadius: '8px',
                    backgroundColor: isSelected ? '#F56A1C' : 'transparent',
                    color: isSelected ? '#fff' : isCurrentMonth ? '#212529' : '#ADB5BD',
                    fontWeight: isSelected ? 600 : 400,
                  }}
                >
                  <Text size="sm">{format(day, 'd')}</Text>
                </Box>
              </Grid.Col>
            );
          })}
        </Grid>
      </Stack>
    </Paper>
  );
};
