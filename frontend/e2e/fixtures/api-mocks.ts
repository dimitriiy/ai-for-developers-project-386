import type { Page, Route } from '@playwright/test';

/**
 * Shape of resources used by the booking app. Mirrors the OpenAPI schema
 * defined in `typespec/main.tsp`.
 */
export interface MockEventType {
  id: string;
  name: string;
  description: string;
  duration: number;
}

export interface MockBooking {
  id: string;
  eventTypeId: string;
  guestName: string;
  guestEmail: string;
  startTime: string;
  endTime: string;
}

export interface MockSlot {
  startTime: string;
  endTime: string;
  status: 'free' | 'busy';
}

interface MockState {
  eventTypes: MockEventType[];
  bookings: MockBooking[];
  slotsByEventType: Record<string, MockSlot[]>;
  /** Last POST /api/bookings payload — useful for assertions. */
  lastBookingPayload?: unknown;
  /** Last POST /api/admin/event-types payload. */
  lastEventTypeCreatePayload?: unknown;
  /** When true, POST /api/bookings always responds with 409. */
  forceBookingConflict?: boolean;
}

const json = (route: Route, status: number, body: unknown) =>
  route.fulfill({
    status,
    contentType: 'application/json',
    body: JSON.stringify(body),
  });

/**
 * Install network mocks for `/api/**`. Returns the mutable state object so
 * that tests can inspect requests or pre-seed data.
 */
export const installApiMocks = async (
  page: Page,
  initial: Partial<MockState> = {},
): Promise<MockState> => {
  const state: MockState = {
    eventTypes: initial.eventTypes ?? [],
    bookings: initial.bookings ?? [],
    slotsByEventType: initial.slotsByEventType ?? {},
    forceBookingConflict: initial.forceBookingConflict ?? false,
  };

  await page.route('**/api/**', async (route) => {
    const request = route.request();
    const url = new URL(request.url());
    const method = request.method();
    const path = url.pathname;

    // ── Admin: event types ────────────────────────────────────────────
    if (path === '/api/admin/event-types' && method === 'GET') {
      return json(route, 200, state.eventTypes);
    }
    if (path === '/api/admin/event-types' && method === 'POST') {
      const body = request.postDataJSON() as Omit<MockEventType, 'id'>;
      state.lastEventTypeCreatePayload = body;
      const created: MockEventType = { id: `et-${Date.now()}`, ...body };
      state.eventTypes.push(created);
      return json(route, 201, created);
    }
    const adminEtMatch = path.match(/^\/api\/admin\/event-types\/([^/]+)$/);
    if (adminEtMatch) {
      const id = decodeURIComponent(adminEtMatch[1]);
      const idx = state.eventTypes.findIndex((et) => et.id === id);
      if (idx === -1) return json(route, 404, { message: 'Not found' });
      if (method === 'GET') return json(route, 200, state.eventTypes[idx]);
      if (method === 'PATCH') {
        const patch = request.postDataJSON() as Partial<MockEventType>;
        state.eventTypes[idx] = { ...state.eventTypes[idx], ...patch };
        return json(route, 200, state.eventTypes[idx]);
      }
      if (method === 'DELETE') {
        state.eventTypes.splice(idx, 1);
        return route.fulfill({ status: 204 });
      }
    }

    // ── Admin: bookings ───────────────────────────────────────────────
    if (path === '/api/admin/bookings' && method === 'GET') {
      return json(route, 200, state.bookings);
    }

    // ── Guest: catalog ────────────────────────────────────────────────
    if (path === '/api/event-types' && method === 'GET') {
      return json(route, 200, state.eventTypes);
    }
    const guestEtMatch = path.match(/^\/api\/event-types\/([^/]+)$/);
    if (guestEtMatch && method === 'GET') {
      const id = decodeURIComponent(guestEtMatch[1]);
      const et = state.eventTypes.find((e) => e.id === id);
      return et
        ? json(route, 200, et)
        : json(route, 404, { message: 'Not found' });
    }

    // ── Guest: slots for a date ───────────────────────────────────────
    const slotsMatch = path.match(/^\/api\/event-types\/([^/]+)\/slots$/);
    if (slotsMatch && method === 'GET') {
      const id = decodeURIComponent(slotsMatch[1]);
      if (!state.eventTypes.some((e) => e.id === id)) {
        return json(route, 404, { message: 'Not found' });
      }
      const slots = state.slotsByEventType[id] ?? [];
      const date = url.searchParams.get('date');
      const filtered = date
        ? slots.filter((s) => s.startTime.startsWith(date))
        : slots;
      return json(route, 200, filtered);
    }

    // ── Guest: bookings ───────────────────────────────────────────────
    if (path === '/api/bookings' && method === 'POST') {
      const body = request.postDataJSON() as {
        eventTypeId: string;
        guestName: string;
        guestEmail: string;
        startTime: string;
      };
      state.lastBookingPayload = body;

      if (state.forceBookingConflict) {
        return json(route, 409, { message: 'Slot is already booked' });
      }

      const et = state.eventTypes.find((e) => e.id === body.eventTypeId);
      if (!et) return json(route, 404, { message: 'Event type not found' });

      const start = new Date(body.startTime);
      const end = new Date(start.getTime() + et.duration * 60_000);

      // Guard: slot must not collide with existing bookings.
      const collision = state.bookings.find((b) => b.startTime === body.startTime);
      if (collision) {
        return json(route, 409, { message: 'Slot already taken' });
      }

      const created: MockBooking = {
        id: `b-${Date.now()}`,
        eventTypeId: body.eventTypeId,
        guestName: body.guestName,
        guestEmail: body.guestEmail,
        startTime: body.startTime,
        endTime: end.toISOString(),
      };
      state.bookings.push(created);

      // Reflect the new booking in slot statuses if we know about them.
      const slots = state.slotsByEventType[body.eventTypeId];
      if (slots) {
        const slot = slots.find((s) => s.startTime === body.startTime);
        if (slot) slot.status = 'busy';
      }

      return json(route, 201, created);
    }

    // ── Fallback ──────────────────────────────────────────────────────
    return json(route, 404, { message: `No mock for ${method} ${path}` });
  });

  return state;
};

/**
 * Build a list of consecutive 30-minute slots for a given local date.
 * Returns ISO strings in UTC. The mock test environment runs with
 * `timezoneId: 'UTC'`, so local dates here line up with what the UI
 * renders.
 */
export const buildSlotsForDate = (
  date: Date,
  hours: number[] = [10, 11, 12, 14, 15, 16],
  status: 'free' | 'busy' = 'free',
): MockSlot[] =>
  hours.map((h) => {
    const start = new Date(
      Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), h, 0, 0),
    );
    const end = new Date(start.getTime() + 30 * 60_000);
    return {
      startTime: start.toISOString(),
      endTime: end.toISOString(),
      status,
    };
  });
