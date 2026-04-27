import {
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
  addMonths,
  subMonths,
  startOfWeek,
  endOfWeek,
} from 'date-fns';
import { ru } from 'date-fns/locale';
import { CalendarDayCell } from './CalendarDayCell';

interface CalendarProps {
  selectedDate: Date;
  onSelectDate: (date: Date) => void;
  onMonthChange: (date: Date) => void;
  currentMonth: Date;
  slotCounts?: Record<string, number>;
}

const weekDays = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];

export const Calendar = ({
  selectedDate,
  onSelectDate,
  onMonthChange,
  currentMonth,
  slotCounts,
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
          <Group gap={4}>
            <Button variant="default" size="compact-sm" radius={6} px={6} onClick={handlePrevMonth}>
              <IconChevronLeft size={14} />
            </Button>
            <Button variant="default" size="compact-sm" radius={6} px={6} onClick={handleNextMonth}>
              <IconChevronRight size={14} />
            </Button>
          </Group>
        </Group>

        <Text fw={500}>
          {format(currentMonth, 'LLLL yyyy', { locale: ru })} г.
        </Text>

        <Grid columns={7} gap={4}>
          {weekDays.map((day) => (
            <Grid.Col key={day} span={1}>
              <Text ta="center" size="sm" c="dimmed" fw={500}>
                {day}
              </Text>
            </Grid.Col>
          ))}

          {days.map((day) => {
            const key = format(day, 'yyyy-MM-dd');
            const count = slotCounts?.[key];

            return (
              <Grid.Col key={day.toISOString()} span={1}>
                <CalendarDayCell
                  day={day}
                  selectedDate={selectedDate}
                  currentMonth={currentMonth}
                  count={count}
                  onSelect={onSelectDate}
                />
              </Grid.Col>
            );
          })}
        </Grid>
      </Stack>
    </Paper>
  );
};
