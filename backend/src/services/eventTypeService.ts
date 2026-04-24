import { IEventTypeRepo, EventType, EventTypeCreate, EventTypeUpdate } from '../db/repositories/types.js';

export interface ValidationErrorDetail {
  field: string;
  message: string;
}

export class EventTypeService {
  constructor(private repo: IEventTypeRepo) {}

  async list(): Promise<EventType[]> {
    return this.repo.findAll();
  }

  async getById(id: string): Promise<EventType | undefined> {
    return this.repo.findById(id);
  }

  async create(data: EventTypeCreate): Promise<{ eventType?: EventType; errors?: ValidationErrorDetail[] }> {
    const errors = this.validateCreate(data);
    if (errors.length > 0) {
      return { errors };
    }
    const eventType = await this.repo.create(data);
    return { eventType };
  }

  async update(id: string, data: EventTypeUpdate): Promise<{ eventType?: EventType; notFound?: boolean; errors?: ValidationErrorDetail[] }> {
    const existing = await this.repo.findById(id);
    if (!existing) {
      return { notFound: true };
    }
    const errors = this.validateUpdate(data);
    if (errors.length > 0) {
      return { errors };
    }
    const eventType = await this.repo.update(id, data);
    return { eventType: eventType! };
  }

  async delete(id: string): Promise<boolean> {
    return this.repo.delete(id);
  }

  private validateCreate(data: EventTypeCreate): ValidationErrorDetail[] {
    const errors: ValidationErrorDetail[] = [];
    if (!data.name || data.name.trim() === '') {
      errors.push({ field: 'name', message: 'Name is required' });
    }
    if (!data.description || data.description.trim() === '') {
      errors.push({ field: 'description', message: 'Description is required' });
    }
    if (data.duration === undefined || data.duration === null || data.duration < 1) {
      errors.push({ field: 'duration', message: 'Duration must be at least 1 minute' });
    }
    return errors;
  }

  private validateUpdate(data: EventTypeUpdate): ValidationErrorDetail[] {
    const errors: ValidationErrorDetail[] = [];
    if (data.name !== undefined && data.name.trim() === '') {
      errors.push({ field: 'name', message: 'Name cannot be empty' });
    }
    if (data.description !== undefined && data.description.trim() === '') {
      errors.push({ field: 'description', message: 'Description cannot be empty' });
    }
    if (data.duration !== undefined && data.duration < 1) {
      errors.push({ field: 'duration', message: 'Duration must be at least 1 minute' });
    }
    return errors;
  }
}
