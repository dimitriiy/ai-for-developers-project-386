# Calendar Booking UI Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a calendar booking UI with 4 pages (Home, Booking Catalog, Booking Slots, Admin) using FSD architecture, Mantine UI, React Query, and TDD

**Architecture:** Feature-Sliced Design with clear layer separation. shared/ contains API client and UI kit, entities/ contain business logic and queries, features/ implement user scenarios, widgets/ compose components, pages/ are route entry points.

**Tech Stack:** React 19 + TypeScript 5.9 + Vite 8 + Mantine 9 + TanStack Query + React Router 7 + Vitest + React Testing Library

**Design Spec:** `docs/superpowers/specs/2025-01-24-calendar-booking-ui-design.md`

**Important:** This plan follows TDD (Test-Driven Development). Every task starts with a failing test, then minimal implementation, then verification.

---

## File Structure Overview

```
frontend/src/
├── app/
│   ├── providers/
│   │   └── AppProviders.tsx
│   ├── styles/
│   │   └── theme.ts
│   ├── router.tsx
│   └── main.tsx (modify)
├── pages/
│   ├── home/
│   │   └── HomePage.tsx
│   ├── booking/
│   │   ├── BookingCatalogPage.tsx
│   │   └── BookingSlotsPage.tsx
│   └── admin/
│       └── AdminPage.tsx
├── widgets/
│   ├── header/
│   │   └── Header.tsx
│   ├── event-type-card/
│   │   └── EventTypeCard.tsx
│   ├── calendar/
│   │   └── Calendar.tsx
│   ├── slots-list/
│   │   └── SlotsList.tsx
│   └── host-profile/
│       └── HostProfile.tsx
├── features/
│   ├── select-event-type/
│   ├── select-slot/
│   ├── create-booking/
│   │   └── BookingModal.tsx
│   └── manage-event-types/
│       ├── EventTypeModal.tsx
│       └── queries.ts
├── entities/
│   ├── event-type/
│   │   ├── model.ts
│   │   └── queries.ts
│   ├── booking/
│   │   ├── model.ts
│   │   └── queries.ts
│   └── slot/
│       ├── model.ts
│       └── queries.ts
├── shared/
│   ├── api/
│   │   ├── base.ts
│   │   ├── event-types.ts
│   │   ├── bookings.ts
│   │   ├── slots.ts
│   │   ├── admin-event-types.ts
│   │   ├── types.ts
│   │   └── index.ts
│   ├── ui/
│   └── lib/
│       └── index.ts
└── tests/
    ├── setup.ts
    ├── api/
    │   └── base.test.ts
    ├── entities/
    │   └── queries.test.ts
    └── widgets/
        └── components.test.tsx
```

---

## Phase 0: Test Environment Setup

### Task 1: Install Test Dependencies

**Files:**
- Modify: `frontend/package.json`

- [ ] **Step 1: Add test dependencies to package.json**

Add to `dependencies`:
```json
"@tanstack/react-query": "^5.62.0",
"react-router-dom": "^7.1.0"
```

Add to `devDependencies`:
```json
"vitest": "^2.1.8",
"@testing-library/react": "^16.1.0",
"@testing-library/jest-dom": "^6.6.3",
"@testing-library/user-event": "^14.5.2",
"jsdom": "^25.0.1",
"msw": "^2.6.9"
```

Add to `scripts`:
```json
"test": "vitest",
"test:ui": "vitest --ui",
"test:coverage": "vitest --coverage"
```

- [ ] **Step 2: Install dependencies**

Run: `cd frontend && yarn install`
Expected: Packages installed successfully

- [ ] **Step 3: Commit**

```bash
git add frontend/package.json frontend/yarn.lock
git commit -m "deps: add vitest, testing-library, and msw for testing"
```

---

### Task 2: Configure Vitest

**Files:**
- Create: `frontend/vitest.config.ts`
- Create: `frontend/src/tests/setup.ts`

- [ ] **Step 1: Write Vitest config**

```typescript
// frontend/vitest.config.ts
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/tests/setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
```

- [ ] **Step 2: Write test setup**

```typescript
// frontend/src/tests/setup.ts
import '@testing-library/jest-dom';
import { cleanup } from '@testing-library/react';
import { afterEach } from 'vitest';

afterEach(() => {
  cleanup();
});
```

- [ ] **Step 3: Write a test to verify setup**

```typescript
// frontend/src/tests/example.test.ts
import { describe, it, expect } from 'vitest';

describe('Test Setup', () => {
  it('should work', () => {
    expect(true).toBe(true);
  });
});
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `cd frontend && yarn test --run`
Expected: Test passes, no errors

- [ ] **Step 5: Commit**

```bash
git add frontend/vitest.config.ts frontend/src/tests/
git commit -m "test: configure vitest and testing-library"
```

---

## Phase 1: API Layer (TDD)

### Task 3: Create Base API Client with Tests

**Files:**
- Create: `frontend/src/shared/api/base.ts`
- Create: `frontend/src/shared/api/base.test.ts`

- [ ] **Step 1: Write the failing test**

```typescript
// frontend/src/shared/api/base.test.ts
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { api } from './base';

describe('API Client', () => {
  const API_BASE = 'http://localhost:3000';

  describe('get', () => {
    it('should make GET request and return data', async () => {
      // This test will fail until we implement
      const data = await api.get('/test');
      expect(data).toBeDefined();
    });

    it('should include query params when provided', async () => {
      const data = await api.get('/test', { params: { date: '2025-01-24' } });
      expect(data).toBeDefined();
    });
  });

  describe('post', () => {
    it('should make POST request with body', async () => {
      const data = await api.post('/test', { name: 'test' });
      expect(data).toBeDefined();
    });
  });

  describe('error handling', () => {
    it('should throw error on non-ok response', async () => {
      await expect(api.get('/error')).rejects.toThrow();
    });
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `cd frontend && yarn test --run src/shared/api/base.test.ts`
Expected: Tests fail with "Cannot find module"

- [ ] **Step 3: Write minimal implementation**

```typescript
// frontend/src/shared/api/base.ts
const API_BASE_URL = 'http://localhost:3000';

interface RequestConfig {
  params?: Record<string, string | undefined>;
}

async function request<T>(
  endpoint: string,
  options?: RequestInit,
  config?: RequestConfig
): Promise<T> {
  let url = `${API_BASE_URL}${endpoint}`;
  
  if (config?.params) {
    const params = new URLSearchParams();
    Object.entries(config.params).forEach(([key, value]) => {
      if (value !== undefined) {
        params.append(key, value);
      }
    });
    const queryString = params.toString();
    if (queryString) {
      url += `?${queryString}`;
    }
  }

  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Unknown error' }));
    throw new Error(error.message || `HTTP ${response.status}`);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json();
}

export const api = {
  get: <T>(endpoint: string, config?: RequestConfig) => 
    request<T>(endpoint, { method: 'GET' }, config),
  
  post: <T>(endpoint: string, data: unknown) => 
    request<T>(endpoint, { method: 'POST', body: JSON.stringify(data) }),
  
  patch: <T>(endpoint: string, data: unknown) => 
    request<T>(endpoint, { method: 'PATCH', body: JSON.stringify(data) }),
  
  delete: (endpoint: string) => 
    request<undefined>(endpoint, { method: 'DELETE' }),
};
```

- [ ] **Step 4: Update tests to use MSW for mocking**

```typescript
// frontend/src/shared/api/base.test.ts
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
```

- [ ] **Step 5: Run tests to verify they pass**

Run: `cd frontend && yarn test --run src/shared/api/base.test.ts`
Expected: All 4 tests pass

- [ ] **Step 6: Commit**

```bash
git add frontend/src/shared/api/base.ts frontend/src/shared/api/base.test.ts
git commit -m "feat(api): create base API client with tests"
```

---

### Task 4: Create API Types (No tests - pure types)

> **FSD Note:** Types used by API layer live in `shared/api/types.ts`. Entity layers re-export them for domain use.

**Files:**
- Create: `frontend/src/shared/api/types.ts`
- Create: `frontend/src/entities/event-type/model.ts` (re-export)
- Create: `frontend/src/entities/booking/model.ts` (re-export)
- Create: `frontend/src/entities/slot/model.ts` (re-export)

- [ ] **Step 1: Write shared API types**

```typescript
// frontend/src/shared/api/types.ts

// EventType
export interface EventType {
  id: string;
  name: string;
  description: string;
  duration: number;
}

export interface EventTypeCreate {
  name: string;
  description: string;
  duration: number;
}

export interface EventTypeUpdate {
  name?: string;
  description?: string;
  duration?: number;
}

// Booking
export interface Booking {
  id: string;
  eventTypeId: string;
  guestName: string;
  guestEmail: string;
  startTime: string;
  endTime: string;
}

export interface BookingCreate {
  eventTypeId: string;
  guestName: string;
  guestEmail: string;
  startTime: string;
}

// Slot
export type SlotStatus = 'free' | 'busy';

export interface Slot {
  startTime: string;
  endTime: string;
  status: SlotStatus;
}
```

- [ ] **Step 2: Re-export in entity layers**

```typescript
// frontend/src/entities/event-type/model.ts
export type { EventType, EventTypeCreate, EventTypeUpdate } from '@/shared/api/types';
```

```typescript
// frontend/src/entities/booking/model.ts
export type { Booking, BookingCreate } from '@/shared/api/types';
```

```typescript
// frontend/src/entities/slot/model.ts
export type { Slot, SlotStatus } from '@/shared/api/types';
```

- [ ] **Step 3: Commit**

```bash
git add frontend/src/shared/api/types.ts frontend/src/entities/
git commit -m "feat(types): add API types in shared layer with entity re-exports"
```

---

### Task 4.5: Configure TypeScript Path Aliases

**Files:**
- Modify: `frontend/tsconfig.json`

- [ ] **Step 1: Add path alias to tsconfig.json**

Ensure `compilerOptions` includes:
```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

- [ ] **Step 2: Commit**

```bash
git add frontend/tsconfig.json
git commit -m "build: add @/ path alias to tsconfig"
```

---

### Task 5: Create API Functions with Tests

**Files:**
- Create: `frontend/src/shared/api/event-types.ts`
- Create: `frontend/src/shared/api/event-types.test.ts`
- Create: `frontend/src/shared/api/bookings.ts`
- Create: `frontend/src/shared/api/bookings.test.ts`
- Create: `frontend/src/shared/api/slots.ts`
- Create: `frontend/src/shared/api/slots.test.ts`

- [ ] **Step 1: Write failing test for event-types API**

```typescript
// frontend/src/shared/api/event-types.test.ts
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
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd frontend && yarn test --run src/shared/api/event-types.test.ts`
Expected: Fail with "Cannot find module"

- [ ] **Step 3: Write minimal implementation**

```typescript
// frontend/src/shared/api/event-types.ts
import { api } from './base';
import type { EventType } from './types';

export const getEventTypes = () => 
  api.get<EventType[]>('/api/event-types');

export const getEventType = (id: string) => 
  api.get<EventType>(`/api/event-types/${id}`);
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `cd frontend && yarn test --run src/shared/api/event-types.test.ts`
Expected: Both tests pass

- [ ] **Step 5: Write test for bookings API**

```typescript
// frontend/src/shared/api/bookings.test.ts
import { describe, it, expect, beforeAll, afterAll, afterEach } from 'vitest';
import { setupServer } from 'msw/node';
import { http, HttpResponse } from 'msw';
import { getBookings, createBooking } from './bookings';

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
      http.get('http://localhost:3000/api/admin/bookings', () => {
        return HttpResponse.json(mockBookings);
      })
    );

    const result = await getBookings();
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
```

- [ ] **Step 6: Write bookings implementation**

```typescript
// frontend/src/shared/api/bookings.ts
import { api } from './base';
import type { Booking, BookingCreate } from './types';

export const getBookings = () => 
  api.get<Booking[]>('/api/bookings');

export const getAdminBookings = () => 
  api.get<Booking[]>('/api/admin/bookings');

export const createBooking = (data: BookingCreate) => 
  api.post<Booking>('/api/bookings', data);
```

- [ ] **Step 7: Run bookings tests**

Run: `cd frontend && yarn test --run src/shared/api/bookings.test.ts`
Expected: Both tests pass

- [ ] **Step 8: Write test for slots API**

```typescript
// frontend/src/shared/api/slots.test.ts
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
```

- [ ] **Step 9: Write slots implementation**

```typescript
// frontend/src/shared/api/slots.ts
import { api } from './base';
import type { Slot } from './types';

export const getSlots = (eventTypeId: string, date?: string) => 
  api.get<Slot[]>(`/api/event-types/${eventTypeId}/slots`, { params: { date } });
```

- [ ] **Step 10: Run slots tests**

Run: `cd frontend && yarn test --run src/shared/api/slots.test.ts`
Expected: Both tests pass

- [ ] **Step 11: Write admin event types API tests**

```typescript
// frontend/src/shared/api/admin-event-types.test.ts
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
```

- [ ] **Step 12: Write admin event types implementation**

```typescript
// frontend/src/shared/api/admin-event-types.ts
import { api } from './base';
import type { EventType, EventTypeCreate, EventTypeUpdate } from './types';

export const getAdminEventTypes = () => 
  api.get<EventType[]>('/api/admin/event-types');

export const createEventType = (data: EventTypeCreate) => 
  api.post<EventType>('/api/admin/event-types', data);

export const updateEventType = (id: string, data: EventTypeUpdate) => 
  api.patch<EventType>(`/api/admin/event-types/${id}`, data);

export const deleteEventType = (id: string) => 
  api.delete(`/api/admin/event-types/${id}`);
```

- [ ] **Step 13: Run admin event types tests**

Run: `cd frontend && yarn test --run src/shared/api/admin-event-types.test.ts`
Expected: All 4 tests pass

- [ ] **Step 14: Run all API tests together**

Run: `cd frontend && yarn test --run src/shared/api/`
Expected: All tests pass

- [ ] **Step 15: Create barrel export for API**

```typescript
// frontend/src/shared/api/index.ts
export * from './types';
export * from './event-types';
export * from './bookings';
export * from './slots';
export * from './admin-event-types';
```

- [ ] **Step 16: Commit**

```bash
git add frontend/src/shared/api/
git commit -m "feat(api): add API functions for events, bookings, slots with tests"
```

---

### Task 6: Create React Query Hooks with Tests

**Files:**
- Create: `frontend/src/entities/event-type/queries.ts`
- Create: `frontend/src/entities/event-type/queries.test.tsx`

- [ ] **Step 1: Write test for event type queries**

```typescript
// frontend/src/entities/event-type/queries.test.tsx
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
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd frontend && yarn test --run src/entities/event-type/queries.test.tsx`
Expected: Fail with "Cannot find module"

- [ ] **Step 3: Write event type queries implementation**

```typescript
// frontend/src/entities/event-type/queries.ts
import { useQuery } from '@tanstack/react-query';
import { getEventTypes, getEventType } from '../../shared/api/event-types';

export const useEventTypes = () => useQuery({
  queryKey: ['event-types'],
  queryFn: getEventTypes,
});

export const useEventType = (id: string) => useQuery({
  queryKey: ['event-type', id],
  queryFn: () => getEventType(id),
  enabled: !!id,
});
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `cd frontend && yarn test --run src/entities/event-type/queries.test.tsx`
Expected: All tests pass

- [ ] **Step 5: Write slot queries test**

```typescript
// frontend/src/entities/slot/queries.test.tsx
import { describe, it, expect, beforeAll, afterAll, afterEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { setupServer } from 'msw/node';
import { http, HttpResponse } from 'msw';
import { useSlots } from './queries';
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
```

- [ ] **Step 6: Write slot queries implementation**

```typescript
// frontend/src/entities/slot/queries.ts
import { useQuery } from '@tanstack/react-query';
import { getSlots } from '../../shared/api/slots';

export const useSlots = (eventTypeId: string, date?: string) => useQuery({
  queryKey: ['slots', eventTypeId, date],
  queryFn: () => getSlots(eventTypeId, date),
  enabled: !!eventTypeId,
});
```

- [ ] **Step 7: Run slot tests**

Run: `cd frontend && yarn test --run src/entities/slot/queries.test.tsx`
Expected: Both tests pass

- [ ] **Step 8: Commit**

```bash
git add frontend/src/entities/event-type/queries.ts frontend/src/entities/event-type/queries.test.tsx
git add frontend/src/entities/slot/queries.ts frontend/src/entities/slot/queries.test.tsx
git commit -m "feat(queries): add React Query hooks with tests"
```

---

## Type-Check Policy

**IMPORTANT:** After creating each new feature/widget/page, ALWAYS run TypeScript type check:

```bash
cd frontend && npx tsc --noEmit
```

If errors are found, fix them before committing. This is a hard requirement for every task.

---

## Phase 2: Design System & Providers (COMPLETED)

- [x] Create theme at `frontend/src/app/styles/theme.ts`
- [x] Create AppProviders at `frontend/src/app/providers/AppProviders.tsx`
- [x] Wire providers in `main.tsx`

---

## Phase 3: Widgets (COMPLETED)

- [x] `widgets/header/Header.tsx` - top navigation with brand and links
- [x] `widgets/event-type-card/EventTypeCard.tsx` - card for event type display
- [x] `widgets/calendar/Calendar.tsx` - month calendar with day selection
- [x] `widgets/slots-list/SlotsList.tsx` - list of time slots
- [x] `widgets/host-profile/HostProfile.tsx` - host avatar and name

---

## Phase 4: Features

### Task 7: Create-Booking Feature

**Files:**
- Create: `frontend/src/features/create-booking/BookingModal.tsx`
- Create: `frontend/src/features/create-booking/index.ts`

- [ ] **Step 1: Implement BookingModal component**
  - Mantine Modal with form (name, email)
  - Use @mantine/form with validation (required + email format)
  - Display booking summary (event type, date/time, duration)
  - Loading state on submit
- [ ] **Step 2: Run type check**: `cd frontend && npx tsc --noEmit`
- [ ] **Step 3: Commit**: `feat(features): add BookingModal for booking creation`

### Task 8: Manage-Event-Types Feature

**Files:**
- Create: `frontend/src/features/manage-event-types/EventTypeModal.tsx`
- Existing: `frontend/src/features/manage-event-types/queries.ts`
- Create: `frontend/src/features/manage-event-types/index.ts`

- [ ] **Step 1: Implement EventTypeModal component (create/edit modes)**
- [ ] **Step 2: Run type check**: `cd frontend && npx tsc --noEmit`
- [ ] **Step 3: Commit**: `feat(features): add EventTypeModal for admin CRUD`

---

## Phase 5: Pages

### Task 9: HomePage

**Files:**
- Create: `frontend/src/pages/home/HomePage.tsx`
- Create: `frontend/src/pages/home/index.ts`

- [ ] **Step 1: Implement landing page with hero section + CTA to /booking**
- [ ] **Step 2: Run type check**: `cd frontend && npx tsc --noEmit`
- [ ] **Step 3: Commit**: `feat(pages): add HomePage`

### Task 10: BookingCatalogPage

**Files:**
- Create: `frontend/src/pages/booking/BookingCatalogPage.tsx`
- Create: `frontend/src/pages/booking/index.ts`

- [ ] **Step 1: Page lists event types via useEventTypes, navigates to slots page on click**
- [ ] **Step 2: Run type check**: `cd frontend && npx tsc --noEmit`
- [ ] **Step 3: Commit**: `feat(pages): add BookingCatalogPage`

### Task 11: BookingSlotsPage

**Files:**
- Create: `frontend/src/pages/booking/BookingSlotsPage.tsx`

- [ ] **Step 1: Page composes Calendar + SlotsList + BookingModal**
  - Reads event type from route params
  - Manages selectedDate state
  - Handles slot selection → opens modal → submit creates booking
- [ ] **Step 2: Run type check**: `cd frontend && npx tsc --noEmit`
- [ ] **Step 3: Commit**: `feat(pages): add BookingSlotsPage`

### Task 12: AdminPage

**Files:**
- Create: `frontend/src/pages/admin/AdminPage.tsx`
- Create: `frontend/src/pages/admin/index.ts`

- [ ] **Step 1: Tabs: Event Types and Bookings**
  - Event Types tab: table with create/edit/delete using EventTypeModal
  - Bookings tab: table listing bookings via useAdminBookings
- [ ] **Step 2: Run type check**: `cd frontend && npx tsc --noEmit`
- [ ] **Step 3: Commit**: `feat(pages): add AdminPage`

---

## Phase 6: Routing

### Task 13: Configure Router

**Files:**
- Modify: `frontend/src/app/router.tsx`

- [ ] **Step 1: Wire all pages with shared Header layout**
  - `/` → HomePage
  - `/booking` → BookingCatalogPage
  - `/booking/:eventTypeId` → BookingSlotsPage
  - `/admin` → AdminPage
- [ ] **Step 2: Run type check**: `cd frontend && npx tsc --noEmit`
- [ ] **Step 3: Commit**: `feat(routing): wire pages into router`

---

## Phase 7: Final Verification

### Task 14: Cleanup and verification

- [ ] **Step 1: Remove obsolete CountdownPage and App template**
- [ ] **Step 2: Run all tests**: `cd frontend && yarn test --run`
- [ ] **Step 3: Run type check**: `cd frontend && npx tsc --noEmit`
- [ ] **Step 4: Run lint**: `cd frontend && yarn lint`
- [ ] **Step 5: Run build**: `cd frontend && yarn build`
- [ ] **Step 6: Commit**: `chore: cleanup obsolete code and verify build`