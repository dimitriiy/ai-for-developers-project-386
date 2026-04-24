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
