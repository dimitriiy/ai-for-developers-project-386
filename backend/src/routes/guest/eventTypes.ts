import { FastifyPluginAsync } from 'fastify';

const guestEventTypesRoutes: FastifyPluginAsync = async (fastify) => {
  // GET /api/event-types
  fastify.get('/', async (_request, reply) => {
    const eventTypes = await fastify.eventTypeService.list();
    return reply.status(200).send(eventTypes);
  });

  // GET /api/event-types/:id
  fastify.get<{ Params: { id: string } }>('/:id', async (request, reply) => {
    const eventType = await fastify.eventTypeService.getById(request.params.id);
    if (!eventType) {
      return reply.status(404).send({ message: `Event type '${request.params.id}' not found` });
    }
    return reply.status(200).send(eventType);
  });
};

export default guestEventTypesRoutes;
