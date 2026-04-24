import { api } from './base';
import type { EventType, EventTypeCreate, EventTypeUpdate } from './types';

export const getAdminEventTypes = () =>
  api.get<EventType[]>('/api/admin/event-types');

export const createEventType = (data: EventTypeCreate) =>
  api.post<EventType>('/api/admin/event-types', data);

export const updateEventType = (id: string, data: EventTypeUpdate) =>
  api.patch<EventType>(`/api/admin/event-types/${id}`, data);

export const deleteEventType = (id: string) =>
  api.delete(`/api/admin/event-types/${id}`);
