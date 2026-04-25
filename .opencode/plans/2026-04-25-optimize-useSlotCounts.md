# Optimize `useSlotCounts`: 14 requests → 1 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace 14 parallel API requests in `useSlotCounts` with a single bulk request using the existing backend endpoint that already supports returning all 14 days of slots at once.

**Architecture:** The backend `GET /api/event-types/:id/slots` endpoint already returns all slots for a 14-day window when called without a `?date` query parameter. The frontend currently makes 14 separate calls (one per day). We'll switch `useSlotCounts` to make a single call without `?date`, then group the returned slots by day on the client side to compute per-day free slot counts.

**Tech Stack:** React, TanStack Query, date-fns, Vitest, MSW

---

## File Structure

| File | Action | Responsibility |
|------|--------|----------------|
| `frontend/src/entities/slot/queries.ts` | Modify (lines 1, 18-45) | Replace `useQueries` with single `useQuery` in `useSlotCounts` |
| `frontend/src/entities/slot/queries.test.tsx` | Modify (add test) | Add test for `useSlotCounts` verifying single API call |

No new files needed. No backend changes.

---

### Task 1: Update `useSlotCounts` to use a single query

**Files:**
- Modify: `frontend/src/entities/slot/queries.ts:1-46`

**Key consideration:** The backend returns `startTime` in ISO 8601 UTC format (e.g., `2025-01-24T10:00:00.000Z`). The date strings we compare against are `yyyy-MM-dd` in local time (e.g., `2025-01-24`). We must group slots by extracting the date portion of the ISO string. Since the backend generates slots using `new Date(date + 'T00:00:00')` (local time constructor) and then `.toISOString()` (UTC), the date part of the ISO string may differ from the original date when the server timezone has a positive UTC offset. However, since both frontend and backend use the same approach, matching by the first 10 characters of `startTime` ISO string is consistent with how the backend generates them. We'll use `format(new Date(slot.startTime), 'yyyy-MM-dd')` from `date-fns` for robust local-time grouping.

- [ ] **Step 1: Rewrite `useSlotCounts` to use a single `useQuery`**

Replace the entire contents of `frontend/src/entities/slot/queries.ts` with:

```ts
import { useQuery } from '@tanstack/react-query';
import { format, addDays, startOfDay } from 'date-fns';
import { getSlots } from '@/shared/api/slots';
import { countFreeSlots } from '@/shared/lib';

export const useSlots = (eventTypeId: string, date?: string) => useQuery({
  queryKey: ['slots', eventTypeId, date],
  queryFn: () => getSlots(eventTypeId, date),
  enabled: !!eventTypeId,
});

const BOOKING_WINDOW_DAYS = 14;

/**
 * Fetch all slots for the 14-day booking window in a single request
 * and compute free slot counts per day.
 * Returns Record<string, number> keyed by 'yyyy-MM-dd'.
 */
export const useSlotCounts = (eventTypeId: string, durationMinutes: number) => {
  const today = startOfDay(new Date());
  const dates = Array.from({ length: BOOKING_WINDOW_DAYS }, (_, i) =>
    format(addDays(today, i), 'yyyy-MM-dd'),
  );

  const { data: allSlots = [], isLoading } = useQuery({
    queryKey: ['slots', eventTypeId, 'all'],
    queryFn: () => getSlots(eventTypeId),
    enabled: !!eventTypeId && durationMinutes > 0,
    staleTime: 5 * 60 * 1000,
  });

  const slotCounts: Record<string, number> = {};

  // Group API slots by date, then count free slots per day
  const slotsByDate = new Map<string, typeof allSlots>();
  for (const slot of allSlots) {
    const dateKey = format(new Date(slot.startTime), 'yyyy-MM-dd');
    const existing = slotsByDate.get(dateKey) ?? [];
    existing.push(slot);
    slotsByDate.set(dateKey, existing);
  }

  dates.forEach((date) => {
    const daySlots = slotsByDate.get(date) ?? [];
    slotCounts[date] = countFreeSlots(date, durationMinutes, daySlots);
  });

  return { slotCounts, isLoading };
};
```

Changes from the original:
1. Import `useQuery` only (removed `useQueries` import)
2. `useSlotCounts` now calls `getSlots(eventTypeId)` without `date` — one request for all 14 days
3. Query key is `['slots', eventTypeId, 'all']` — separate from per-day cache entries used by `useSlots`
4. Slots are grouped into a `Map<string, Slot[]>` by date using `date-fns` `format()`, then `countFreeSlots` is called per day as before

- [ ] **Step 2: Verify the app compiles**

Run: `cd frontend && npx tsc --noEmit`
Expected: No type errors

- [ ] **Step 3: Commit**

```bash
git add frontend/src/entities/slot/queries.ts
git commit -m "perf: replace 14 parallel slot queries with single bulk request in useSlotCounts"
```

---

### Task 2: Add test for `useSlotCounts`

**Files:**
- Modify: `frontend/src/entities/slot/queries.test.tsx`

- [ ] **Step 1: Add test for `useSlotCounts` that verifies a single API call is made**

Update the import on line 6 to include `useSlotCounts`:

```ts
import { useSlots, useSlotCounts } from './queries';
```

Add the following test suite at the end of `frontend/src/entities/slot/queries.test.tsx`, after the closing `});` of the existing `describe('useSlots', ...)`:

```ts
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
```

- [ ] **Step 2: Run the tests**

Run: `cd frontend && npx vitest run src/entities/slot/queries.test.tsx`
Expected: All tests pass (both existing `useSlots` tests and new `useSlotCounts` tests)

- [ ] **Step 3: Commit**

```bash
git add frontend/src/entities/slot/queries.test.tsx
git commit -m "test: add useSlotCounts tests verifying single bulk request"
```

---

### Task 3: Manual verification

- [ ] **Step 1: Start the dev server and open booking page**

Navigate to a booking slots page (e.g., `/booking/:eventTypeId`). In the Network tab, verify:
- Only **1** request to `/api/event-types/:id/slots` (without `?date=` param) is made for slot counts
- A **separate** request to `/api/event-types/:id/slots?date=YYYY-MM-DD` is still made for the selected day's slot list (from `useSlots`)
- Calendar still shows slot availability indicators correctly

- [ ] **Step 2: Run the full test suite**

Run: `cd frontend && npx vitest run`
Expected: All tests pass
