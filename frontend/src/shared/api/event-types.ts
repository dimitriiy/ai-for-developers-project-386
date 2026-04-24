import { api } from './base';
import type { EventType } from './types';

export const getEventTypes = () =>
  api.get<EventType[]>('/api/event-types');

export const getEventType = (id: string) =>
  api.get<EventType>(`/api/event-types/${id}`);
