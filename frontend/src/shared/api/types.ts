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
