import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getBookings, getAdminBookings, createBooking } from '@/shared/api/bookings';
import type { BookingCreate } from '@/shared/api/types';

export const useBookings = () => useQuery({
  queryKey: ['bookings'],
  queryFn: getBookings,
});

export const useAdminBookings = () => useQuery({
  queryKey: ['admin-bookings'],
  queryFn: getAdminBookings,
});

export const useCreateBooking = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: BookingCreate) => createBooking(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      queryClient.invalidateQueries({ queryKey: ['admin-bookings'] });
    },
  });
};
