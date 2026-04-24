import { describe, it, expect, beforeAll, afterAll, afterEach } from 'vitest';
import { setupServer } from 'msw/node';
import { http, HttpResponse } from 'msw';
import { api } from './base';

const server = setupServer();

beforeAll(() => server.listen());
afterAll(() => server.close());
afterEach(() => server.resetHandlers());

describe('API Client', () => {
  it('should make GET request and return data', async () => {
    server.use(
      http.get('http://localhost:3000/test', () => {
        return HttpResponse.json({ success: true });
      })
    );

    const data = await api.get('/test');
    expect(data).toEqual({ success: true });
  });

  it('should include query params when provided', async () => {
    server.use(
      http.get('http://localhost:3000/test', ({ request }) => {
        const url = new URL(request.url);
        expect(url.searchParams.get('date')).toBe('2025-01-24');
        return HttpResponse.json({ filtered: true });
      })
    );

    const data = await api.get('/test', { params: { date: '2025-01-24' } });
    expect(data).toEqual({ filtered: true });
  });

  it('should make POST request with body', async () => {
    server.use(
      http.post('http://localhost:3000/test', async ({ request }) => {
        const body = await request.json();
        return HttpResponse.json({ received: body });
      })
    );

    const data = await api.post('/test', { name: 'test' });
    expect(data).toEqual({ received: { name: 'test' } });
  });

  it('should throw error on non-ok response', async () => {
    server.use(
      http.get('http://localhost:3000/error', () => {
        return HttpResponse.json(
          { message: 'Not found' },
          { status: 404 }
        );
      })
    );

    await expect(api.get('/error')).rejects.toThrow('Not found');
  });
});
