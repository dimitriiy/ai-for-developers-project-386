import { FastifyPluginAsync } from 'fastify';
import { BookingCreate } from '../../db/repositories/types.js';

const guestBookingsRoutes: FastifyPluginAsync = async (fastify) => {
  // POST /api/bookings
  fastify.post<{ Body: BookingCreate }>('/', async (request, reply) => {
    const result = await fastify.bookingService.create(request.body);

    if ('validationErrors' in result) {
      return reply.status(422).send({ message: 'Validation failed', errors: result.validationErrors });
    }
    if ('notFound' in result) {
      return reply.status(404).send({ message: result.message });
    }
    if ('conflict' in result) {
      return reply.status(409).send({ message: result.message });
    }
    return reply.status(201).send(result.booking);
  });
};

export default guestBookingsRoutes;
