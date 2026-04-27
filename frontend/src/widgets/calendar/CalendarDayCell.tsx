import { Box, Text } from '@mantine/core';
import { format, isSameDay, isSameMonth } from 'date-fns';
import classes from './CalendarDayCell.module.css';

interface CalendarDayCellProps {
  day: Date;
  selectedDate: Date;
  currentMonth: Date;
  count?: number;
  onSelect: (date: Date) => void;
}

export const CalendarDayCell = ({
  day,
  selectedDate,
  currentMonth,
  count,
  onSelect,
}: CalendarDayCellProps) => {
  const isSelected = isSameDay(day, selectedDate);
  const isCurrentMonth = isSameMonth(day, currentMonth);
  const hasAvailableSlots = isCurrentMonth && count !== undefined && count > 0;
  const isClickable = isCurrentMonth && count !== undefined;

  const getDayBackground = () => {
    if (!isCurrentMonth) return 'transparent';
    return hasAvailableSlots ? '#fff' : '#f2f6fa';
  };

  return (
    <Box
      onClick={() => isClickable && onSelect(day)}
      className={classes.dayCell}
      style={{
        cursor: isClickable ? 'pointer' : 'default',
        backgroundColor: getDayBackground(),
        color: isCurrentMonth ? '#212529' : '#ADB5BD',
        fontWeight: isSelected ? 600 : 400,
        border: isSelected ? '2px solid #333' : '1px solid #e9ecef',
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
  );
};
