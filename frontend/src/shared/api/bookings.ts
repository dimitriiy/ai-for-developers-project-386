import { api } from './base';
import type { Booking, BookingCreate } from './types';

export const getBookings = () =>
  api.get<Booking[]>('/api/bookings');

export const getAdminBookings = () =>
  api.get<Booking[]>('/api/admin/bookings');

export const createBooking = (data: BookingCreate) =>
  api.post<Booking>('/api/bookings', data);
