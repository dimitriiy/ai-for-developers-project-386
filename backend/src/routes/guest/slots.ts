import { FastifyPluginAsync } from 'fastify';

const guestSlotsRoutes: FastifyPluginAsync = async (fastify) => {
  // GET /api/event-types/:eventTypeId/slots
  fastify.get<{ Params: { eventTypeId: string }; Querystring: { date?: string } }>('/', async (request, reply) => {
    const { eventTypeId } = request.params;
    const { date } = request.query;

    const result = await fastify.slotService.getSlots(eventTypeId, date);
    if (result.notFound) {
      return reply.status(404).send({ message: `Event type '${eventTypeId}' not found` });
    }
    return reply.status(200).send(result.slots);
  });
};

export default guestSlotsRoutes;
