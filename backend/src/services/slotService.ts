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
