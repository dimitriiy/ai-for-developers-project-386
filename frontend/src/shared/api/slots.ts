import { api } from './base';
import type { Slot } from './types';

export const getSlots = (eventTypeId: string, date?: string) =>
  api.get<Slot[]>(`/api/event-types/${eventTypeId}/slots`, { params: { date } });
