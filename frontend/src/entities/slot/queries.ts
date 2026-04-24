import { useQuery } from '@tanstack/react-query';
import { getSlots } from '@/shared/api/slots';

export const useSlots = (eventTypeId: string, date?: string) => useQuery({
  queryKey: ['slots', eventTypeId, date],
  queryFn: () => getSlots(eventTypeId, date),
  enabled: !!eventTypeId,
});
