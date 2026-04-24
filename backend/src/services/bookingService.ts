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
    const startHour = startTime.getHours();
    const endHour = endTime.getHours();
    const endMinute = endTime.getMinutes();

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
