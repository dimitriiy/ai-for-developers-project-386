import { useQuery, useQueries } from '@tanstack/react-query';
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
 * Fetch slots for 14 days starting from today and compute free slot counts per day.
 * Returns Record<string, number> keyed by 'yyyy-MM-dd'.
 */
export const useSlotCounts = (eventTypeId: string, durationMinutes: number) => {
  const today = startOfDay(new Date());
  const dates = Array.from({ length: BOOKING_WINDOW_DAYS }, (_, i) =>
    format(addDays(today, i), 'yyyy-MM-dd'),
  );

  const queries = useQueries({
    queries: dates.map((date) => ({
      queryKey: ['slots', eventTypeId, date],
      queryFn: () => getSlots(eventTypeId, date),
      enabled: !!eventTypeId && durationMinutes > 0,
      staleTime: 5 * 60 * 1000,
    })),
  });

  const slotCounts: Record<string, number> = {};
  let isLoading = false;

  dates.forEach((date, i) => {
    const query = queries[i];
    if (query.isLoading) {
      isLoading = true;
    }
    const apiSlots = query.data ?? [];
    slotCounts[date] = countFreeSlots(date, durationMinutes, apiSlots);
  });

  return { slotCounts, isLoading };
};
