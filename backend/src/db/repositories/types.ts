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
