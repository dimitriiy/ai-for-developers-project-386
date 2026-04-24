import { describe, it, expect, beforeAll, afterAll, afterEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { setupServer } from 'msw/node';
import { http, HttpResponse } from 'msw';
import { useEventTypes, useEventType } from './queries';
import type { ReactNode } from 'react';

const server = setupServer();

beforeAll(() => server.listen());
afterAll(() => server.close());
afterEach(() => server.resetHandlers());

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe('useEventTypes', () => {
  it('should fetch and cache event types', async () => {
    const mockData = [{ id: '1', name: 'Test', description: 'Desc', duration: 15 }];

    server.use(
      http.get('http://localhost:3000/api/event-types', () => {
        return HttpResponse.json(mockData);
      })
    );

    const { result } = renderHook(() => useEventTypes(), {
      wrapper: createWrapper(),
    });

    expect(result.current.isLoading).toBe(true);

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toEqual(mockData);
  });
});

describe('useEventType', () => {
  it('should fetch single event type when id is provided', async () => {
    const mockData = { id: '1', name: 'Test', description: 'Desc', duration: 15 };

    server.use(
      http.get('http://localhost:3000/api/event-types/1', () => {
        return HttpResponse.json(mockData);
      })
    );

    const { result } = renderHook(() => useEventType('1'), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(mockData);
  });

  it('should not fetch when id is empty', () => {
    const { result } = renderHook(() => useEventType(''), {
      wrapper: createWrapper(),
    });

    expect(result.current.isLoading).toBe(false);
    expect(result.current.fetchStatus).toBe('idle');
  });
});
