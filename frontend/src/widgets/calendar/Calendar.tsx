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

  const getDayBackground = (isCurrentMonth: boolean, hasAvailableSlots: boolean) => {
    if (!isCurrentMonth) return 'transparent';
    return hasAvailableSlots ? '#fff' : '#f2f6fa';
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
            const isSelected = isSameDay(day, selectedDate);
            const isCurrentMonth = isSameMonth(day, currentMonth);
            const key = format(day, 'yyyy-MM-dd');
            const count = slotCounts?.[key];
            const hasAvailableSlots = isCurrentMonth && count !== undefined && count > 0;
            const isClickable = isCurrentMonth && count !== undefined;

            return (
              <Grid.Col key={day.toISOString()} span={1}>
                 <Box
                   onClick={() => isClickable && onSelectDate(day)}
                   style={{
                     aspectRatio: '1',
                     display: 'flex',
                     flexDirection: 'column',
                     alignItems: 'center',
                     justifyContent: 'center',
                     cursor: isClickable ? 'pointer' : 'default',
                     borderRadius: '6px',
                     backgroundColor: getDayBackground(isCurrentMonth, hasAvailableSlots),
                     color: isCurrentMonth ? '#212529' : '#ADB5BD',
                     fontWeight: isSelected ? 600 : 400,
                     border: isSelected ? '2px solid #333' : '1px solid transparent',
                     opacity: isCurrentMonth && !isClickable ? 0.5 : 1,
                   }}
                 >
                  <Text size="sm" lh={1.3}>{format(day, 'd')}</Text>
                  {hasAvailableSlots && (
                    <Text fz={9} c="dimmed" lh={1}>
                      {count} св.
                    </Text>
                  )}
                </Box>
              </Grid.Col>
            );
          })}
        </Grid>
      </Stack>
    </Paper>
  );
};
