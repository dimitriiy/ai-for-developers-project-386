import { describe, it, expect, beforeAll, afterAll, afterEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { setupServer } from 'msw/node';
import { http, HttpResponse } from 'msw';
import { useSlots, useSlotCounts } from './queries';
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

describe('useSlots', () => {
  it('should fetch slots for event type and date', async () => {
    const mockSlots = [
      { startTime: '2025-01-24T10:00:00Z', endTime: '2025-01-24T10:15:00Z', status: 'free' },
    ];

    server.use(
      http.get('http://localhost:3000/api/event-types/1/slots', () => {
        return HttpResponse.json(mockSlots);
      })
    );

    const { result } = renderHook(() => useSlots('1', '2025-01-24'), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(mockSlots);
  });

  it('should not fetch without eventTypeId', () => {
    const { result } = renderHook(() => useSlots(''), {
      wrapper: createWrapper(),
    });

    expect(result.current.isLoading).toBe(false);
  });
});

describe('useSlotCounts', () => {
  it('should fetch all slots in a single request without date param', async () => {
    const mockSlots = [
      { startTime: '2025-01-24T10:00:00.000Z', endTime: '2025-01-24T10:30:00.000Z', status: 'free' },
      { startTime: '2025-01-24T10:30:00.000Z', endTime: '2025-01-24T11:00:00.000Z', status: 'busy' },
    ];

    let requestCount = 0;
    server.use(
      http.get('http://localhost:3000/api/event-types/1/slots', ({ request }) => {
        requestCount++;
        const url = new URL(request.url);
        // Verify no date param is sent — bulk request
        expect(url.searchParams.has('date')).toBe(false);
        return HttpResponse.json(mockSlots);
      }),
    );

    const { result } = renderHook(() => useSlotCounts('1', 30), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(requestCount).toBe(1);
    expect(typeof result.current.slotCounts).toBe('object');
  });

  it('should not fetch without eventTypeId', () => {
    const { result } = renderHook(() => useSlotCounts('', 30), {
      wrapper: createWrapper(),
    });

    expect(result.current.isLoading).toBe(false);
  });

  it('should not fetch when durationMinutes is 0', () => {
    const { result } = renderHook(() => useSlotCounts('1', 0), {
      wrapper: createWrapper(),
    });

    expect(result.current.isLoading).toBe(false);
  });
});
