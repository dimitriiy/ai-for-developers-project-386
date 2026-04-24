import { describe, it, expect, beforeAll, afterAll, afterEach } from 'vitest';
import { setupServer } from 'msw/node';
import { http, HttpResponse } from 'msw';
import { getBookings, getAdminBookings, createBooking } from './bookings';

const server = setupServer();

beforeAll(() => server.listen());
afterAll(() => server.close());
afterEach(() => server.resetHandlers());

describe('Bookings API', () => {
  it('should fetch all bookings', async () => {
    const mockBookings = [
      { id: '1', eventTypeId: '1', guestName: 'John', guestEmail: 'john@test.com', startTime: '2025-01-24T10:00:00Z', endTime: '2025-01-24T10:15:00Z' },
    ];

    server.use(
      http.get('http://localhost:3000/api/bookings', () => {
        return HttpResponse.json(mockBookings);
      })
    );

    const result = await getBookings();
    expect(result).toEqual(mockBookings);
  });

  it('should fetch admin bookings', async () => {
    const mockBookings = [
      { id: '1', eventTypeId: '1', guestName: 'John', guestEmail: 'john@test.com', startTime: '2025-01-24T10:00:00Z', endTime: '2025-01-24T10:15:00Z' },
    ];

    server.use(
      http.get('http://localhost:3000/api/admin/bookings', () => {
        return HttpResponse.json(mockBookings);
      })
    );

    const result = await getAdminBookings();
    expect(result).toEqual(mockBookings);
  });

  it('should create booking', async () => {
    const newBooking = { eventTypeId: '1', guestName: 'Jane', guestEmail: 'jane@test.com', startTime: '2025-01-24T11:00:00Z' };
    const createdBooking = { id: '2', ...newBooking, endTime: '2025-01-24T11:15:00Z' };

    server.use(
      http.post('http://localhost:3000/api/bookings', async ({ request }) => {
        const body = await request.json();
        expect(body).toEqual(newBooking);
        return HttpResponse.json(createdBooking, { status: 201 });
      })
    );

    const result = await createBooking(newBooking);
    expect(result).toEqual(createdBooking);
  });
});
