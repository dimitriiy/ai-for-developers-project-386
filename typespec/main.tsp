import "@typespec/http";
import "@typespec/rest";
import "@typespec/openapi";

using TypeSpec.Http;
using TypeSpec.Rest;
using TypeSpec.OpenAPI;

@service(#{
  title: "Calendar Booking API",
})
@info(#{
  version: "1.0.0",
})
@doc("API for a calendar booking system. The owner manages event types and views upcoming bookings. Guests browse event types, check available slots within a 14-day window, and create bookings.")
@server("http://localhost:3000", "Local development server")
namespace CalendarBooking;

// ──────────────────────────────────────────────
// Models
// ──────────────────────────────────────────────

@doc("Event type created by the calendar owner")
model EventType {
  @doc("Unique identifier")
  id: string;

  @doc("Display name, e.g. 'Встреча 15 минут'")
  name: string;

  @doc("Short description shown to guests")
  description: string;

  @doc("Duration in minutes")
  @minValue(1)
  duration: int32;
}

@doc("Payload for creating a new event type")
model EventTypeCreate {
  name: string;
  description: string;

  @minValue(1)
  duration: int32;
}

@doc("Payload for updating an existing event type")
model EventTypeUpdate {
  name?: string;
  description?: string;

  @minValue(1)
  duration?: int32;
}

@doc("A booking made by a guest for a specific event type and time slot")
model Booking {
  @doc("Unique identifier")
  id: string;

  @doc("Reference to the event type")
  eventTypeId: string;

  @doc("Guest name")
  guestName: string;

  @doc("Guest email")
  guestEmail: string;

  @doc("Start date-time of the booking (ISO 8601)")
  startTime: utcDateTime;

  @doc("End date-time of the booking (ISO 8601)")
  endTime: utcDateTime;
}

@doc("Payload for creating a new booking")
model BookingCreate {
  @doc("Reference to the event type")
  eventTypeId: string;

  @doc("Guest name")
  guestName: string;

  @doc("Guest email")
  guestEmail: string;

  @doc("Start date-time of the desired slot (ISO 8601)")
  startTime: utcDateTime;
}

@doc("Status of a time slot")
union SlotStatus {
  free: "free",
  busy: "busy",
}

@doc("A single time slot for a given date")
model Slot {
  @doc("Slot start time (ISO 8601)")
  startTime: utcDateTime;

  @doc("Slot end time (ISO 8601)")
  endTime: utcDateTime;

  @doc("Whether the slot is free or busy")
  status: SlotStatus;
}

// ──────────────────────────────────────────────
// Error models
// ──────────────────────────────────────────────

@doc("Resource not found")
@error
model NotFoundError {
  @statusCode statusCode: 404;
  message: string;
}

@doc("Conflict — the slot is already booked")
@error
model ConflictError {
  @statusCode statusCode: 409;
  message: string;
}

@doc("Validation error detail")
model ValidationErrorDetail {
  field: string;
  message: string;
}

@doc("Validation error response (422)")
@error
model ValidationError {
  @statusCode statusCode: 422;
  message: string;
  errors: ValidationErrorDetail[];
}

// ──────────────────────────────────────────────
// Admin endpoints — Event Types
// ──────────────────────────────────────────────

@route("/api/admin/event-types")
@tag("Admin: Event Types")
namespace AdminEventTypes {
  @doc("List all event types")
  @get
  op list(): {
    @statusCode statusCode: 200;
    @body body: EventType[];
  };

  @doc("Create a new event type")
  @post
  op create(@body body: EventTypeCreate): {
    @statusCode statusCode: 201;
    @body body: EventType;
  } | ValidationError;

  @doc("Get a single event type by ID")
  @get
  @route("/{id}")
  op read(@path id: string): {
    @statusCode statusCode: 200;
    @body body: EventType;
  } | NotFoundError;

  @doc("Update an existing event type")
  @patch
  @route("/{id}")
  op update(@path id: string, @body body: EventTypeUpdate): {
    @statusCode statusCode: 200;
    @body body: EventType;
  } | NotFoundError | ValidationError;

  @doc("Delete an event type")
  @delete
  @route("/{id}")
  op delete(@path id: string): {
    @statusCode statusCode: 204;
  } | NotFoundError;
}

// ──────────────────────────────────────────────
// Admin endpoints — Bookings
// ──────────────────────────────────────────────

@route("/api/admin/bookings")
@tag("Admin: Bookings")
namespace AdminBookings {
  @doc("List all upcoming bookings across all event types, sorted by startTime ascending")
  @get
  op list(): {
    @statusCode statusCode: 200;
    @body body: Booking[];
  };
}

// ──────────────────────────────────────────────
// Guest endpoints — Event Types catalog
// ──────────────────────────────────────────────

@route("/api/event-types")
@tag("Guest: Event Types")
namespace GuestEventTypes {
  @doc("List all event types available for booking (public catalog)")
  @get
  op list(): {
    @statusCode statusCode: 200;
    @body body: EventType[];
  };

  @doc("Get details of a specific event type")
  @get
  @route("/{id}")
  op read(@path id: string): {
    @statusCode statusCode: 200;
    @body body: EventType;
  } | NotFoundError;
}

// ──────────────────────────────────────────────
// Guest endpoints — Available slots
// ──────────────────────────────────────────────

@route("/api/event-types/{eventTypeId}/slots")
@tag("Guest: Slots")
namespace GuestSlots {
  @doc("Get available time slots for an event type within the 14-day booking window. Optionally filter by a specific date.")
  @get
  op list(
    @path eventTypeId: string,
    @query date?: plainDate,
  ): {
    @statusCode statusCode: 200;
    @body body: Slot[];
  } | NotFoundError;
}

// ──────────────────────────────────────────────
// Guest endpoints — Bookings
// ──────────────────────────────────────────────

@route("/api/bookings")
@tag("Guest: Bookings")
namespace GuestBookings {
  @doc("Create a booking for a free slot. The server validates that the slot is within the 14-day window and is not already taken by any event type.")
  @post
  op create(@body body: BookingCreate): {
    @statusCode statusCode: 201;
    @body body: Booking;
  } | ValidationError | ConflictError | NotFoundError;
}
