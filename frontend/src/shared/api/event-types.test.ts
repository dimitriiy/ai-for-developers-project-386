import { describe, it, expect, beforeAll, afterAll, afterEach } from 'vitest';
import { setupServer } from 'msw/node';
import { http, HttpResponse } from 'msw';
import { getEventTypes, getEventType } from './event-types';

const server = setupServer();

beforeAll(() => server.listen());
afterAll(() => server.close());
afterEach(() => server.resetHandlers());

describe('Event Types API', () => {
  it('should fetch all event types', async () => {
    const mockEventTypes = [
      { id: '1', name: 'Meeting 15 min', description: 'Quick meeting', duration: 15 },
      { id: '2', name: 'Meeting 30 min', description: 'Standard meeting', duration: 30 },
    ];

    server.use(
      http.get('http://localhost:3000/api/event-types', () => {
        return HttpResponse.json(mockEventTypes);
      })
    );

    const result = await getEventTypes();
    expect(result).toEqual(mockEventTypes);
  });

  it('should fetch single event type by id', async () => {
    const mockEventType = { id: '1', name: 'Meeting', description: 'Test', duration: 15 };

    server.use(
      http.get('http://localhost:3000/api/event-types/1', () => {
        return HttpResponse.json(mockEventType);
      })
    );

    const result = await getEventType('1');
    expect(result).toEqual(mockEventType);
  });
});
