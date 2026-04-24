import { describe, it, expect, beforeAll, afterAll, afterEach } from 'vitest';
import { setupServer } from 'msw/node';
import { http, HttpResponse } from 'msw';
import { getAdminEventTypes, createEventType, updateEventType, deleteEventType } from './admin-event-types';

const server = setupServer();

beforeAll(() => server.listen());
afterAll(() => server.close());
afterEach(() => server.resetHandlers());

describe('Admin Event Types API', () => {
  it('should fetch all event types', async () => {
    const mockTypes = [{ id: '1', name: 'Test', description: 'Desc', duration: 15 }];

    server.use(
      http.get('http://localhost:3000/api/admin/event-types', () => {
        return HttpResponse.json(mockTypes);
      })
    );

    const result = await getAdminEventTypes();
    expect(result).toEqual(mockTypes);
  });

  it('should create event type', async () => {
    const newType = { name: 'New', description: 'New desc', duration: 30 };

    server.use(
      http.post('http://localhost:3000/api/admin/event-types', async ({ request }) => {
        const body = await request.json();
        return HttpResponse.json({ id: '2', ...body }, { status: 201 });
      })
    );

    const result = await createEventType(newType);
    expect(result.name).toBe('New');
  });

  it('should update event type', async () => {
    server.use(
      http.patch('http://localhost:3000/api/admin/event-types/1', async ({ request }) => {
        const body = await request.json();
        return HttpResponse.json({ id: '1', ...body });
      })
    );

    const result = await updateEventType('1', { name: 'Updated' });
    expect(result.name).toBe('Updated');
  });

  it('should delete event type', async () => {
    server.use(
      http.delete('http://localhost:3000/api/admin/event-types/1', () => {
        return new HttpResponse(null, { status: 204 });
      })
    );

    await expect(deleteEventType('1')).resolves.toBeUndefined();
  });
});
