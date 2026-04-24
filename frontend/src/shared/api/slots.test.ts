import { describe, it, expect, beforeAll, afterAll, afterEach } from 'vitest';
import { setupServer } from 'msw/node';
import { http, HttpResponse } from 'msw';
import { getSlots } from './slots';

const server = setupServer();

beforeAll(() => server.listen());
afterAll(() => server.close());
afterEach(() => server.resetHandlers());

describe('Slots API', () => {
  it('should fetch slots for event type', async () => {
    const mockSlots = [
      { startTime: '2025-01-24T10:00:00Z', endTime: '2025-01-24T10:15:00Z', status: 'free' },
      { startTime: '2025-01-24T10:15:00Z', endTime: '2025-01-24T10:30:00Z', status: 'busy' },
    ];

    server.use(
      http.get('http://localhost:3000/api/event-types/1/slots', () => {
        return HttpResponse.json(mockSlots);
      })
    );

    const result = await getSlots('1');
    expect(result).toEqual(mockSlots);
  });

  it('should include date param when provided', async () => {
    server.use(
      http.get('http://localhost:3000/api/event-types/1/slots', ({ request }) => {
        const url = new URL(request.url);
        expect(url.searchParams.get('date')).toBe('2025-01-24');
        return HttpResponse.json([]);
      })
    );

    await getSlots('1', '2025-01-24');
  });
});
