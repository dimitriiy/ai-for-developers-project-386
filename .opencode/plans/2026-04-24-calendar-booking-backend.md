# Calendar Booking Backend Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement the Calendar Booking API backend per the TypeSpec contract in `typespec/main.tsp`, using Fastify + TypeScript + SQLite (in-memory) with async DB access and repository interfaces for easy future DB migration.

**Architecture:** Layered approach — thin Fastify route plugins delegate to service layer, which uses repository interfaces for data access. SQLite implementations of repositories are the current concrete implementation. All business rules (slot generation, conflict detection, validation) live in services.

**Tech Stack:** Fastify 5, TypeScript, `sqlite3` + `sqlite` (async wrapper), `@fastify/cors`, `crypto.randomUUID()` for IDs.

---

## File Structure

```
backend/src/
  server.ts              — entry point, starts the app
  app.ts                 — creates Fastify instance, registers CORS + routes, injects repos
  types.ts               — Fastify type augmentation for service injection
  db/
    database.ts          — initDb(): opens in-memory SQLite, runs schema, returns Database
    repositories/
      types.ts           — IEventTypeRepo, IBookingRepo interfaces + domain types
      eventTypeRepo.ts   — SQLite implementation of IEventTypeRepo
      bookingRepo.ts     — SQLite implementation of IBookingRepo
  routes/
    admin/
      eventTypes.ts      — Fastify plugin for /api/admin/event-types
      bookings.ts        — Fastify plugin for /api/admin/bookings
    guest/
      eventTypes.ts      — Fastify plugin for /api/event-types
      slots.ts           — Fastify plugin for /api/event-types/:eventTypeId/slots
      bookings.ts        — Fastify plugin for /api/bookings
  services/
    eventTypeService.ts  — EventTypeService class
    bookingService.ts    — BookingService class
    slotService.ts       — SlotService class
```

---

### Task 1: Install dependencies

**Files:**
- Modify: `backend/package.json`

- [ ] **Step 1: Install production dependencies**

Run from `backend/`:
```bash
yarn add sqlite3 sqlite @fastify/cors
```

- [ ] **Step 2: Commit**

```bash
git add backend/package.json backend/yarn.lock
git commit -m "chore: add sqlite3, sqlite, @fastify/cors dependencies"
```

---

### Task 2: Repository interfaces and domain types

**Files:**
- Create: `backend/src/db/repositories/types.ts`

- [ ] **Step 1: Create repository interfaces**

```typescript
// backend/src/db/repositories/types.ts

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

export interface Booking {
  id: string;
  eventTypeId: string;
  guestName: string;
  guestEmail: string;
  startTime: string; // ISO 8601
  endTime: string;   // ISO 8601
}

export interface BookingCreate {
  eventTypeId: string;
  guestName: string;
  guestEmail: string;
  startTime: string; // ISO 8601
}

export interface IEventTypeRepo {
  findAll(): Promise<EventType[]>;
  findById(id: string): Promise<EventType | undefined>;
  create(data: EventTypeCreate): Promise<EventType>;
  update(id: string, data: EventTypeUpdate): Promise<EventType | undefined>;
  delete(id: string): Promise<boolean>;
}

export interface IBookingRepo {
  findAll(): Promise<Booking[]>;
  findUpcoming(now: string): Promise<Booking[]>;
  findOverlapping(startTime: string, endTime: string): Promise<Booking[]>;
  create(data: Booking): Promise<Booking>;
}
```

- [ ] **Step 2: Commit**

```bash
git add backend/src/db/repositories/types.ts
git commit -m "feat: add repository interfaces and domain types"
```

---

### Task 3: Database initialization

**Files:**
- Create: `backend/src/db/database.ts`

- [ ] **Step 1: Create database module**

```typescript
// backend/src/db/database.ts

import sqlite3 from 'sqlite3';
import { open, Database } from 'sqlite';

export type AppDatabase = Database<sqlite3.Database, sqlite3.Statement>;

export const initDb = async (): Promise<AppDatabase> => {
  const db = await open({
    filename: ':memory:',
    driver: sqlite3.Database,
  });

  await db.exec(`
    CREATE TABLE IF NOT EXISTS event_types (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT NOT NULL,
      duration INTEGER NOT NULL CHECK(duration > 0)
    );

    CREATE TABLE IF NOT EXISTS bookings (
      id TEXT PRIMARY KEY,
      event_type_id TEXT NOT NULL REFERENCES event_types(id),
      guest_name TEXT NOT NULL,
      guest_email TEXT NOT NULL,
      start_time TEXT NOT NULL,
      end_time TEXT NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_bookings_time ON bookings(start_time, end_time);
  `);

  return db;
};
```

- [ ] **Step 2: Commit**

```bash
git add backend/src/db/database.ts
git commit -m "feat: add SQLite in-memory database initialization"
```

---

### Task 4: EventType repository (SQLite implementation)

**Files:**
- Create: `backend/src/db/repositories/eventTypeRepo.ts`

- [ ] **Step 1: Implement EventTypeRepo**

```typescript
// backend/src/db/repositories/eventTypeRepo.ts

import crypto from 'node:crypto';
import { AppDatabase } from '../database.js';
import { EventType, EventTypeCreate, EventTypeUpdate, IEventTypeRepo } from './types.js';

export class EventTypeRepo implements IEventTypeRepo {
  constructor(private db: AppDatabase) {}

  async findAll(): Promise<EventType[]> {
    const rows = await this.db.all('SELECT id, name, description, duration FROM event_types');
    return rows as EventType[];
  }

  async findById(id: string): Promise<EventType | undefined> {
    const row = await this.db.get('SELECT id, name, description, duration FROM event_types WHERE id = ?', id);
    return row as EventType | undefined;
  }

  async create(data: EventTypeCreate): Promise<EventType> {
    const id = crypto.randomUUID();
    await this.db.run(
      'INSERT INTO event_types (id, name, description, duration) VALUES (?, ?, ?, ?)',
      id, data.name, data.description, data.duration,
    );
    return { id, ...data };
  }

  async update(id: string, data: EventTypeUpdate): Promise<EventType | undefined> {
    const existing = await this.findById(id);
    if (!existing) return undefined;

    const updated: EventType = {
      ...existing,
      ...(data.name !== undefined && { name: data.name }),
      ...(data.description !== undefined && { description: data.description }),
      ...(data.duration !== undefined && { duration: data.duration }),
    };

    await this.db.run(
      'UPDATE event_types SET name = ?, description = ?, duration = ? WHERE id = ?',
      updated.name, updated.description, updated.duration, id,
    );

    return updated;
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.db.run('DELETE FROM event_types WHERE id = ?', id);
    return (result.changes ?? 0) > 0;
  }
}
```

- [ ] **Step 2: Commit**

```bash
git add backend/src/db/repositories/eventTypeRepo.ts
git commit -m "feat: add SQLite EventType repository implementation"
```

---

### Task 5: Booking repository (SQLite implementation)

**Files:**
- Create: `backend/src/db/repositories/bookingRepo.ts`

- [ ] **Step 1: Implement BookingRepo**

```typescript
// backend/src/db/repositories/bookingRepo.ts

import { AppDatabase } from '../database.js';
import { Booking, IBookingRepo } from './types.js';

interface BookingRow {
  id: string;
  event_type_id: string;
  guest_name: string;
  guest_email: string;
  start_time: string;
  end_time: string;
}

const toBooking = (row: BookingRow): Booking => ({
  id: row.id,
  eventTypeId: row.event_type_id,
  guestName: row.guest_name,
  guestEmail: row.guest_email,
  startTime: row.start_time,
  endTime: row.end_time,
});

export class BookingRepo implements IBookingRepo {
  constructor(private db: AppDatabase) {}

  async findAll(): Promise<Booking[]> {
    const rows = await this.db.all(
      'SELECT id, event_type_id, guest_name, guest_email, start_time, end_time FROM bookings ORDER BY start_time ASC',
    );
    return (rows as BookingRow[]).map(toBooking);
  }

  async findUpcoming(now: string): Promise<Booking[]> {
    const rows = await this.db.all(
      'SELECT id, event_type_id, guest_name, guest_email, start_time, end_time FROM bookings WHERE start_time >= ? ORDER BY start_time ASC',
      now,
    );
    return (rows as BookingRow[]).map(toBooking);
  }

  async findOverlapping(startTime: string, endTime: string): Promise<Booking[]> {
    const rows = await this.db.all(
      'SELECT id, event_type_id, guest_name, guest_email, start_time, end_time FROM bookings WHERE start_time < ? AND end_time > ?',
      endTime, startTime,
    );
    return (rows as BookingRow[]).map(toBooking);
  }

  async create(data: Booking): Promise<Booking> {
    await this.db.run(
      'INSERT INTO bookings (id, event_type_id, guest_name, guest_email, start_time, end_time) VALUES (?, ?, ?, ?, ?, ?)',
      data.id, data.eventTypeId, data.guestName, data.guestEmail, data.startTime, data.endTime,
    );
    return data;
  }
}
```

- [ ] **Step 2: Commit**

```bash
git add backend/src/db/repositories/bookingRepo.ts
git commit -m "feat: add SQLite Booking repository implementation"
```

---

### Task 6: EventType service

**Files:**
- Create: `backend/src/services/eventTypeService.ts`

- [ ] **Step 1: Implement EventTypeService**

```typescript
// backend/src/services/eventTypeService.ts

import { IEventTypeRepo, EventType, EventTypeCreate, EventTypeUpdate } from '../db/repositories/types.js';

export interface ValidationErrorDetail {
  field: string;
  message: string;
}

export class EventTypeService {
  constructor(private repo: IEventTypeRepo) {}

  async list(): Promise<EventType[]> {
    return this.repo.findAll();
  }

  async getById(id: string): Promise<EventType | undefined> {
    return this.repo.findById(id);
  }

  async create(data: EventTypeCreate): Promise<{ eventType?: EventType; errors?: ValidationErrorDetail[] }> {
    const errors = this.validateCreate(data);
    if (errors.length > 0) {
      return { errors };
    }
    const eventType = await this.repo.create(data);
    return { eventType };
  }

  async update(id: string, data: EventTypeUpdate): Promise<{ eventType?: EventType; notFound?: boolean; errors?: ValidationErrorDetail[] }> {
    const existing = await this.repo.findById(id);
    if (!existing) {
      return { notFound: true };
    }
    const errors = this.validateUpdate(data);
    if (errors.length > 0) {
      return { errors };
    }
    const eventType = await this.repo.update(id, data);
    return { eventType: eventType! };
  }

  async delete(id: string): Promise<boolean> {
    return this.repo.delete(id);
  }

  private validateCreate(data: EventTypeCreate): ValidationErrorDetail[] {
    const errors: ValidationErrorDetail[] = [];
    if (!data.name || data.name.trim() === '') {
      errors.push({ field: 'name', message: 'Name is required' });
    }
    if (!data.description || data.description.trim() === '') {
      errors.push({ field: 'description', message: 'Description is required' });
    }
    if (data.duration === undefined || data.duration === null || data.duration < 1) {
      errors.push({ field: 'duration', message: 'Duration must be at least 1 minute' });
    }
    return errors;
  }

  private validateUpdate(data: EventTypeUpdate): ValidationErrorDetail[] {
    const errors: ValidationErrorDetail[] = [];
    if (data.name !== undefined && data.name.trim() === '') {
      errors.push({ field: 'name', message: 'Name cannot be empty' });
    }
    if (data.description !== undefined && data.description.trim() === '') {
      errors.push({ field: 'description', message: 'Description cannot be empty' });
    }
    if (data.duration !== undefined && data.duration < 1) {
      errors.push({ field: 'duration', message: 'Duration must be at least 1 minute' });
    }
    return errors;
  }
}
```

- [ ] **Step 2: Commit**

```bash
git add backend/src/services/eventTypeService.ts
git commit -m "feat: add EventType service with validation"
```

---

### Task 7: Slot service

**Files:**
- Create: `backend/src/services/slotService.ts`

- [ ] **Step 1: Implement SlotService**

```typescript
// backend/src/services/slotService.ts

import { IBookingRepo, IEventTypeRepo } from '../db/repositories/types.js';

export interface Slot {
  startTime: string; // ISO 8601
  endTime: string;   // ISO 8601
  status: 'free' | 'busy';
}

const WORK_START_HOUR = 9;
const WORK_END_HOUR = 18;
const BOOKING_WINDOW_DAYS = 14;

export class SlotService {
  constructor(
    private eventTypeRepo: IEventTypeRepo,
    private bookingRepo: IBookingRepo,
  ) {}

  async getSlots(eventTypeId: string, date?: string): Promise<{ slots?: Slot[]; notFound?: boolean }> {
    const eventType = await this.eventTypeRepo.findById(eventTypeId);
    if (!eventType) {
      return { notFound: true };
    }

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    const windowEnd = new Date(today);
    windowEnd.setDate(windowEnd.getDate() + BOOKING_WINDOW_DAYS);

    let startDate: Date;
    let endDate: Date;

    if (date) {
      const requested = new Date(date + 'T00:00:00');
      if (requested < today || requested > windowEnd) {
        return { slots: [] };
      }
      startDate = requested;
      endDate = new Date(requested);
      endDate.setDate(endDate.getDate() + 1);
    } else {
      startDate = today;
      endDate = windowEnd;
    }

    // Fetch all bookings in the date range to check for overlaps
    const rangeStart = new Date(startDate);
    rangeStart.setHours(WORK_START_HOUR, 0, 0, 0);
    const rangeEnd = new Date(endDate);
    rangeEnd.setHours(WORK_END_HOUR, 0, 0, 0);

    const existingBookings = await this.bookingRepo.findOverlapping(
      rangeStart.toISOString(),
      rangeEnd.toISOString(),
    );

    const slots: Slot[] = [];
    const duration = eventType.duration;

    const currentDate = new Date(startDate);
    while (currentDate < endDate) {
      const dayStart = new Date(currentDate);
      dayStart.setHours(WORK_START_HOUR, 0, 0, 0);

      const dayEnd = new Date(currentDate);
      dayEnd.setHours(WORK_END_HOUR, 0, 0, 0);

      let slotStart = new Date(dayStart);

      while (slotStart.getTime() + duration * 60 * 1000 <= dayEnd.getTime()) {
        const slotEnd = new Date(slotStart.getTime() + duration * 60 * 1000);

        // Skip slots in the past
        if (slotEnd > now) {
          const isBusy = existingBookings.some(
            (b) => b.startTime < slotEnd.toISOString() && b.endTime > slotStart.toISOString(),
          );

          slots.push({
            startTime: slotStart.toISOString(),
            endTime: slotEnd.toISOString(),
            status: isBusy ? 'busy' : 'free',
          });
        }

        slotStart = new Date(slotEnd);
      }

      currentDate.setDate(currentDate.getDate() + 1);
    }

    return { slots };
  }
}
```

- [ ] **Step 2: Commit**

```bash
git add backend/src/services/slotService.ts
git commit -m "feat: add SlotService with 9-18 working hours and 14-day window"
```

---

### Task 8: Booking service

**Files:**
- Create: `backend/src/services/bookingService.ts`

- [ ] **Step 1: Implement BookingService**

```typescript
// backend/src/services/bookingService.ts

import crypto from 'node:crypto';
import { IBookingRepo, IEventTypeRepo, Booking } from '../db/repositories/types.js';
import { ValidationErrorDetail } from './eventTypeService.js';

const WORK_START_HOUR = 9;
const WORK_END_HOUR = 18;
const BOOKING_WINDOW_DAYS = 14;

interface BookingCreateInput {
  eventTypeId: string;
  guestName: string;
  guestEmail: string;
  startTime: string;
}

type BookingResult =
  | { booking: Booking }
  | { notFound: true; message: string }
  | { conflict: true; message: string }
  | { validationErrors: ValidationErrorDetail[] };

export class BookingService {
  constructor(
    private bookingRepo: IBookingRepo,
    private eventTypeRepo: IEventTypeRepo,
  ) {}

  async listUpcoming(): Promise<Booking[]> {
    const now = new Date().toISOString();
    return this.bookingRepo.findUpcoming(now);
  }

  async create(data: BookingCreateInput): Promise<BookingResult> {
    // 1. Validate required fields
    const validationErrors = this.validateInput(data);
    if (validationErrors.length > 0) {
      return { validationErrors };
    }

    // 2. Check event type exists
    const eventType = await this.eventTypeRepo.findById(data.eventTypeId);
    if (!eventType) {
      return { notFound: true, message: `Event type '${data.eventTypeId}' not found` };
    }

    // 3. Calculate endTime
    const startTime = new Date(data.startTime);
    const endTime = new Date(startTime.getTime() + eventType.duration * 60 * 1000);

    // 4. Validate within working hours (9:00-18:00)
    const startHour = startTime.getUTCHours();
    const endHour = endTime.getUTCHours();
    const endMinute = endTime.getUTCMinutes();

    if (startHour < WORK_START_HOUR || endHour > WORK_END_HOUR || (endHour === WORK_END_HOUR && endMinute > 0)) {
      return {
        validationErrors: [{
          field: 'startTime',
          message: `Slot must fall within working hours (${WORK_START_HOUR}:00-${WORK_END_HOUR}:00)`,
        }],
      };
    }

    // 5. Validate within 14-day booking window
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const windowEnd = new Date(today);
    windowEnd.setDate(windowEnd.getDate() + BOOKING_WINDOW_DAYS + 1);

    if (startTime < today || startTime >= windowEnd) {
      return {
        validationErrors: [{
          field: 'startTime',
          message: `Slot must be within the ${BOOKING_WINDOW_DAYS}-day booking window`,
        }],
      };
    }

    // 6. Check for conflicts (across ALL event types)
    const overlapping = await this.bookingRepo.findOverlapping(
      startTime.toISOString(),
      endTime.toISOString(),
    );

    if (overlapping.length > 0) {
      return { conflict: true, message: 'The selected time slot is already booked' };
    }

    // 7. Create booking
    const booking: Booking = {
      id: crypto.randomUUID(),
      eventTypeId: data.eventTypeId,
      guestName: data.guestName,
      guestEmail: data.guestEmail,
      startTime: startTime.toISOString(),
      endTime: endTime.toISOString(),
    };

    await this.bookingRepo.create(booking);
    return { booking };
  }

  private validateInput(data: BookingCreateInput): ValidationErrorDetail[] {
    const errors: ValidationErrorDetail[] = [];

    if (!data.eventTypeId || data.eventTypeId.trim() === '') {
      errors.push({ field: 'eventTypeId', message: 'Event type ID is required' });
    }
    if (!data.guestName || data.guestName.trim() === '') {
      errors.push({ field: 'guestName', message: 'Guest name is required' });
    }
    if (!data.guestEmail || data.guestEmail.trim() === '') {
      errors.push({ field: 'guestEmail', message: 'Guest email is required' });
    }
    if (!data.startTime || data.startTime.trim() === '') {
      errors.push({ field: 'startTime', message: 'Start time is required' });
    } else {
      const parsed = new Date(data.startTime);
      if (isNaN(parsed.getTime())) {
        errors.push({ field: 'startTime', message: 'Start time must be a valid ISO 8601 date' });
      }
    }

    return errors;
  }
}
```

- [ ] **Step 2: Commit**

```bash
git add backend/src/services/bookingService.ts
git commit -m "feat: add BookingService with conflict detection and validation"
```

---

### Task 9: Fastify type declarations for service injection

**Files:**
- Create: `backend/src/types.ts`

- [ ] **Step 1: Create Fastify type augmentation**

```typescript
// backend/src/types.ts

import { EventTypeService } from './services/eventTypeService.js';
import { BookingService } from './services/bookingService.js';
import { SlotService } from './services/slotService.js';

declare module 'fastify' {
  interface FastifyInstance {
    eventTypeService: EventTypeService;
    bookingService: BookingService;
    slotService: SlotService;
  }
}
```

- [ ] **Step 2: Commit**

```bash
git add backend/src/types.ts
git commit -m "feat: add Fastify type declarations for service injection"
```

---

### Task 10: Admin Event Types route

**Files:**
- Create: `backend/src/routes/admin/eventTypes.ts`

- [ ] **Step 1: Implement admin event types routes**

```typescript
// backend/src/routes/admin/eventTypes.ts

import { FastifyPluginAsync } from 'fastify';
import { EventTypeCreate, EventTypeUpdate } from '../../db/repositories/types.js';

const adminEventTypesRoutes: FastifyPluginAsync = async (fastify) => {
  // GET /api/admin/event-types
  fastify.get('/', async (_request, reply) => {
    const eventTypes = await fastify.eventTypeService.list();
    return reply.status(200).send(eventTypes);
  });

  // POST /api/admin/event-types
  fastify.post<{ Body: EventTypeCreate }>('/', async (request, reply) => {
    const result = await fastify.eventTypeService.create(request.body);
    if (result.errors) {
      return reply.status(422).send({ message: 'Validation failed', errors: result.errors });
    }
    return reply.status(201).send(result.eventType);
  });

  // GET /api/admin/event-types/:id
  fastify.get<{ Params: { id: string } }>('/:id', async (request, reply) => {
    const eventType = await fastify.eventTypeService.getById(request.params.id);
    if (!eventType) {
      return reply.status(404).send({ message: `Event type '${request.params.id}' not found` });
    }
    return reply.status(200).send(eventType);
  });

  // PATCH /api/admin/event-types/:id
  fastify.patch<{ Params: { id: string }; Body: EventTypeUpdate }>('/:id', async (request, reply) => {
    const result = await fastify.eventTypeService.update(request.params.id, request.body);
    if (result.notFound) {
      return reply.status(404).send({ message: `Event type '${request.params.id}' not found` });
    }
    if (result.errors) {
      return reply.status(422).send({ message: 'Validation failed', errors: result.errors });
    }
    return reply.status(200).send(result.eventType);
  });

  // DELETE /api/admin/event-types/:id
  fastify.delete<{ Params: { id: string } }>('/:id', async (request, reply) => {
    const deleted = await fastify.eventTypeService.delete(request.params.id);
    if (!deleted) {
      return reply.status(404).send({ message: `Event type '${request.params.id}' not found` });
    }
    return reply.status(204).send();
  });
};

export default adminEventTypesRoutes;
```

- [ ] **Step 2: Commit**

```bash
git add backend/src/routes/admin/eventTypes.ts
git commit -m "feat: add admin event types routes"
```

---

### Task 11: Admin Bookings route

**Files:**
- Create: `backend/src/routes/admin/bookings.ts`

- [ ] **Step 1: Implement admin bookings route**

```typescript
// backend/src/routes/admin/bookings.ts

import { FastifyPluginAsync } from 'fastify';

const adminBookingsRoutes: FastifyPluginAsync = async (fastify) => {
  // GET /api/admin/bookings
  fastify.get('/', async (_request, reply) => {
    const bookings = await fastify.bookingService.listUpcoming();
    return reply.status(200).send(bookings);
  });
};

export default adminBookingsRoutes;
```

- [ ] **Step 2: Commit**

```bash
git add backend/src/routes/admin/bookings.ts
git commit -m "feat: add admin bookings route"
```

---

### Task 12: Guest Event Types route

**Files:**
- Create: `backend/src/routes/guest/eventTypes.ts`

- [ ] **Step 1: Implement guest event types routes**

```typescript
// backend/src/routes/guest/eventTypes.ts

import { FastifyPluginAsync } from 'fastify';

const guestEventTypesRoutes: FastifyPluginAsync = async (fastify) => {
  // GET /api/event-types
  fastify.get('/', async (_request, reply) => {
    const eventTypes = await fastify.eventTypeService.list();
    return reply.status(200).send(eventTypes);
  });

  // GET /api/event-types/:id
  fastify.get<{ Params: { id: string } }>('/:id', async (request, reply) => {
    const eventType = await fastify.eventTypeService.getById(request.params.id);
    if (!eventType) {
      return reply.status(404).send({ message: `Event type '${request.params.id}' not found` });
    }
    return reply.status(200).send(eventType);
  });
};

export default guestEventTypesRoutes;
```

- [ ] **Step 2: Commit**

```bash
git add backend/src/routes/guest/eventTypes.ts
git commit -m "feat: add guest event types routes"
```

---

### Task 13: Guest Slots route

**Files:**
- Create: `backend/src/routes/guest/slots.ts`

- [ ] **Step 1: Implement guest slots route**

```typescript
// backend/src/routes/guest/slots.ts

import { FastifyPluginAsync } from 'fastify';

const guestSlotsRoutes: FastifyPluginAsync = async (fastify) => {
  // GET /api/event-types/:eventTypeId/slots
  fastify.get<{ Params: { eventTypeId: string }; Querystring: { date?: string } }>('/', async (request, reply) => {
    const { eventTypeId } = request.params;
    const { date } = request.query;

    const result = await fastify.slotService.getSlots(eventTypeId, date);
    if (result.notFound) {
      return reply.status(404).send({ message: `Event type '${eventTypeId}' not found` });
    }
    return reply.status(200).send(result.slots);
  });
};

export default guestSlotsRoutes;
```

- [ ] **Step 2: Commit**

```bash
git add backend/src/routes/guest/slots.ts
git commit -m "feat: add guest slots route"
```

---

### Task 14: Guest Bookings route

**Files:**
- Create: `backend/src/routes/guest/bookings.ts`

- [ ] **Step 1: Implement guest bookings route**

```typescript
// backend/src/routes/guest/bookings.ts

import { FastifyPluginAsync } from 'fastify';
import { BookingCreate } from '../../db/repositories/types.js';

const guestBookingsRoutes: FastifyPluginAsync = async (fastify) => {
  // POST /api/bookings
  fastify.post<{ Body: BookingCreate }>('/', async (request, reply) => {
    const result = await fastify.bookingService.create(request.body);

    if ('validationErrors' in result) {
      return reply.status(422).send({ message: 'Validation failed', errors: result.validationErrors });
    }
    if ('notFound' in result) {
      return reply.status(404).send({ message: result.message });
    }
    if ('conflict' in result) {
      return reply.status(409).send({ message: result.message });
    }
    return reply.status(201).send(result.booking);
  });
};

export default guestBookingsRoutes;
```

- [ ] **Step 2: Commit**

```bash
git add backend/src/routes/guest/bookings.ts
git commit -m "feat: add guest bookings route with conflict handling"
```

---

### Task 15: App factory (app.ts)

**Files:**
- Create: `backend/src/app.ts`

- [ ] **Step 1: Implement buildApp factory**

```typescript
// backend/src/app.ts

import Fastify, { FastifyInstance } from 'fastify';
import cors from '@fastify/cors';
import { initDb } from './db/database.js';
import { EventTypeRepo } from './db/repositories/eventTypeRepo.js';
import { BookingRepo } from './db/repositories/bookingRepo.js';
import { EventTypeService } from './services/eventTypeService.js';
import { BookingService } from './services/bookingService.js';
import { SlotService } from './services/slotService.js';
import './types.js';

import adminEventTypesRoutes from './routes/admin/eventTypes.js';
import adminBookingsRoutes from './routes/admin/bookings.js';
import guestEventTypesRoutes from './routes/guest/eventTypes.js';
import guestSlotsRoutes from './routes/guest/slots.js';
import guestBookingsRoutes from './routes/guest/bookings.js';

export const buildApp = async (): Promise<FastifyInstance> => {
  const fastify = Fastify({ logger: true });

  // CORS
  await fastify.register(cors, { origin: true });

  // Database
  const db = await initDb();

  // Repositories
  const eventTypeRepo = new EventTypeRepo(db);
  const bookingRepo = new BookingRepo(db);

  // Services — decorate onto Fastify instance
  fastify.decorate('eventTypeService', new EventTypeService(eventTypeRepo));
  fastify.decorate('bookingService', new BookingService(bookingRepo, eventTypeRepo));
  fastify.decorate('slotService', new SlotService(eventTypeRepo, bookingRepo));

  // Health check
  fastify.get('/health', async () => {
    return { status: 'ok', timestamp: new Date().toISOString() };
  });

  // Routes
  await fastify.register(adminEventTypesRoutes, { prefix: '/api/admin/event-types' });
  await fastify.register(adminBookingsRoutes, { prefix: '/api/admin/bookings' });
  await fastify.register(guestEventTypesRoutes, { prefix: '/api/event-types' });
  await fastify.register(guestSlotsRoutes, { prefix: '/api/event-types/:eventTypeId/slots' });
  await fastify.register(guestBookingsRoutes, { prefix: '/api/bookings' });

  return fastify;
};
```

- [ ] **Step 2: Commit**

```bash
git add backend/src/app.ts
git commit -m "feat: add app factory with DI, CORS, and route registration"
```

---

### Task 16: Update server.ts

**Files:**
- Modify: `backend/src/server.ts`

- [ ] **Step 1: Replace server.ts with app bootstrap**

Replace the entire content of `backend/src/server.ts` with:

```typescript
// backend/src/server.ts

import { buildApp } from './app.js';

const PORT = Number(process.env.PORT) || 3000;
const HOST = process.env.HOST || '0.0.0.0';

const start = async (): Promise<void> => {
  const app = await buildApp();
  try {
    await app.listen({ port: PORT, host: HOST });
    app.log.info(`Server listening on http://${HOST}:${PORT}`);
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
};

start();
```

- [ ] **Step 2: Commit**

```bash
git add backend/src/server.ts
git commit -m "feat: update server.ts to use app factory"
```

---

### Task 17: Build verification and smoke test

- [ ] **Step 1: Build the TypeScript project**

Run from `backend/`:
```bash
yarn build
```

Expected: Clean compilation with no errors.

- [ ] **Step 2: Start the dev server and test endpoints**

Run from `backend/`:
```bash
yarn dev
```

In another terminal, test the full flow:
```bash
# 1. Health check
curl http://localhost:3000/health
# Expected: {"status":"ok","timestamp":"..."}

# 2. Create an event type
curl -X POST http://localhost:3000/api/admin/event-types \
  -H "Content-Type: application/json" \
  -d '{"name":"Quick Call","description":"15 minute call","duration":15}'
# Expected: 201 with {"id":"...","name":"Quick Call","description":"15 minute call","duration":15}

# 3. List event types (guest)
curl http://localhost:3000/api/event-types
# Expected: 200 with array containing the created event type

# 4. Get slots (replace <id> with actual event type ID from step 2)
curl "http://localhost:3000/api/event-types/<id>/slots?date=2026-04-25"
# Expected: 200 with array of slot objects, all status "free"

# 5. Create a booking (replace <id>)
curl -X POST http://localhost:3000/api/bookings \
  -H "Content-Type: application/json" \
  -d '{"eventTypeId":"<id>","guestName":"John","guestEmail":"john@test.com","startTime":"2026-04-25T10:00:00.000Z"}'
# Expected: 201 with booking object

# 6. Try same slot again — conflict (replace <id>)
curl -X POST http://localhost:3000/api/bookings \
  -H "Content-Type: application/json" \
  -d '{"eventTypeId":"<id>","guestName":"Jane","guestEmail":"jane@test.com","startTime":"2026-04-25T10:00:00.000Z"}'
# Expected: 409 with {"message":"The selected time slot is already booked"}

# 7. Check slots now show busy
curl "http://localhost:3000/api/event-types/<id>/slots?date=2026-04-25"
# Expected: The 10:00 slot now has status "busy"

# 8. Admin list upcoming bookings
curl http://localhost:3000/api/admin/bookings
# Expected: 200 with array containing the created booking
```

- [ ] **Step 3: Final commit**

```bash
git add -A
git commit -m "feat: complete Calendar Booking API backend implementation"
```
