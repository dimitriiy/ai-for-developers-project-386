import { useQuery } from '@tanstack/react-query';
import { format, addDays, startOfDay } from 'date-fns';
import { getSlots } from '@/shared/api/slots';
import { countFreeSlots } from '@/shared/lib';

export const useSlots = (eventTypeId: string, date?: string) => useQuery({
  queryKey: ['slots', eventTypeId, date],
  queryFn: () => getSlots(eventTypeId, date),
  enabled: !!eventTypeId,
});

const BOOKING_WINDOW_DAYS = 14;

/**
 * Fetch all slots for the 14-day booking window in a single request
 * and compute free slot counts per day.
 * Returns Record<string, number> keyed by 'yyyy-MM-dd'.
 */
export const useSlotCounts = (eventTypeId: string, durationMinutes: number) => {
  const today = startOfDay(new Date());
  const dates = Array.from({ length: BOOKING_WINDOW_DAYS }, (_, i) =>
    format(addDays(today, i), 'yyyy-MM-dd'),
  );

  const { data: allSlots = [], isLoading } = useQuery({
    queryKey: ['slots', eventTypeId, 'all'],
    queryFn: () => getSlots(eventTypeId),
    enabled: !!eventTypeId && durationMinutes > 0,
    staleTime: 5 * 60 * 1000,
  });

  const slotCounts: Record<string, number> = {};

  // Group API slots by date, then count free slots per day
  const slotsByDate = new Map<string, typeof allSlots>();
  for (const slot of allSlots) {
    const dateKey = format(new Date(slot.startTime), 'yyyy-MM-dd');
    const existing = slotsByDate.get(dateKey) ?? [];
    existing.push(slot);
    slotsByDate.set(dateKey, existing);
  }

  dates.forEach((date) => {
    const daySlots = slotsByDate.get(date) ?? [];
    slotCounts[date] = countFreeSlots(date, durationMinutes, daySlots);
  });

  return { slotCounts, isLoading };
};
