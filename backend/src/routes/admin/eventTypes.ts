import { FastifyPluginAsync } from 'fastify';
import { EventTypeCreate, EventTypeUpdate } from '../../db/repositories/types.js';

const adminEventTypesRoutes: FastifyPluginAsync = async (fastify) => {
  // GET /api/admin/event-types
  fastify.get('/', async (_request, reply) => {
    const eventTypes = await fastify.eventTypeService.list();
    return reply.status(200).send(eventTypes);
  });

  // POST /api/admin/event-types
  fastify.post<{ Body: EventTypeCreate }>('/', async (request, reply) => {
    const result = await fastify.eventTypeService.create(request.body);
    if (result.errors) {
      return reply.status(422).send({ message: 'Validation failed', errors: result.errors });
    }
    return reply.status(201).send(result.eventType);
  });

  // GET /api/admin/event-types/:id
  fastify.get<{ Params: { id: string } }>('/:id', async (request, reply) => {
    const eventType = await fastify.eventTypeService.getById(request.params.id);
    if (!eventType) {
      return reply.status(404).send({ message: `Event type '${request.params.id}' not found` });
    }
    return reply.status(200).send(eventType);
  });

  // PATCH /api/admin/event-types/:id
  fastify.patch<{ Params: { id: string }; Body: EventTypeUpdate }>('/:id', async (request, reply) => {
    const result = await fastify.eventTypeService.update(request.params.id, request.body);
    if (result.notFound) {
      return reply.status(404).send({ message: `Event type '${request.params.id}' not found` });
    }
    if (result.errors) {
      return reply.status(422).send({ message: 'Validation failed', errors: result.errors });
    }
    return reply.status(200).send(result.eventType);
  });

  // DELETE /api/admin/event-types/:id
  fastify.delete<{ Params: { id: string } }>('/:id', async (request, reply) => {
    const deleted = await fastify.eventTypeService.delete(request.params.id);
    if (!deleted) {
      return reply.status(404).send({ message: `Event type '${request.params.id}' not found` });
    }
    return reply.status(204).send();
  });
};

export default adminEventTypesRoutes;
