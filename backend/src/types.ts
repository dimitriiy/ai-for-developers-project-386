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
