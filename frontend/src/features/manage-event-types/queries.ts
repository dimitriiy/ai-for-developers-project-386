import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getAdminEventTypes,
  createEventType,
  updateEventType,
  deleteEventType,
} from '@/shared/api/admin-event-types';
import type { EventTypeCreate, EventTypeUpdate } from '@/shared/api/types';

export const useAdminEventTypes = () => useQuery({
  queryKey: ['admin-event-types'],
  queryFn: getAdminEventTypes,
});

export const useCreateEventType = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: EventTypeCreate) => createEventType(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-event-types'] });
      queryClient.invalidateQueries({ queryKey: ['event-types'] });
    },
  });
};

export const useUpdateEventType = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: EventTypeUpdate }) =>
      updateEventType(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-event-types'] });
      queryClient.invalidateQueries({ queryKey: ['event-types'] });
    },
  });
};

export const useDeleteEventType = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteEventType(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-event-types'] });
      queryClient.invalidateQueries({ queryKey: ['event-types'] });
    },
  });
};
