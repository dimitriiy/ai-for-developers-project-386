import crypto from 'node:crypto';
import { AppDatabase } from '../database.js';
import { EventType, EventTypeCreate, EventTypeUpdate, IEventTypeRepo } from './types.js';

export class EventTypeRepo implements IEventTypeRepo {
  constructor(private db: AppDatabase) {}

  async findAll(): Promise<EventType[]> {
    const rows = await this.db.all('SELECT id, name, description, duration FROM event_types');
    return rows as EventType[];
  }

  async findById(id: string): Promise<EventType | undefined> {
    const row = await this.db.get('SELECT id, name, description, duration FROM event_types WHERE id = ?', id);
    return row as EventType | undefined;
  }

  async create(data: EventTypeCreate): Promise<EventType> {
    const id = crypto.randomUUID();
    await this.db.run(
      'INSERT INTO event_types (id, name, description, duration) VALUES (?, ?, ?, ?)',
      id, data.name, data.description, data.duration,
    );
    return { id, ...data };
  }

  async update(id: string, data: EventTypeUpdate): Promise<EventType | undefined> {
    const existing = await this.findById(id);
    if (!existing) return undefined;

    const updated: EventType = {
      ...existing,
      ...(data.name !== undefined && { name: data.name }),
      ...(data.description !== undefined && { description: data.description }),
      ...(data.duration !== undefined && { duration: data.duration }),
    };

    await this.db.run(
      'UPDATE event_types SET name = ?, description = ?, duration = ? WHERE id = ?',
      updated.name, updated.description, updated.duration, id,
    );

    return updated;
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.db.run('DELETE FROM event_types WHERE id = ?', id);
    return (result.changes ?? 0) > 0;
  }
}
