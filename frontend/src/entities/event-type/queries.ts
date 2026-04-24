import { useQuery } from '@tanstack/react-query';
import { getEventTypes, getEventType } from '@/shared/api/event-types';

export const useEventTypes = () => useQuery({
  queryKey: ['event-types'],
  queryFn: getEventTypes,
});

export const useEventType = (id: string) => useQuery({
  queryKey: ['event-type', id],
  queryFn: () => getEventType(id),
  enabled: !!id,
});
