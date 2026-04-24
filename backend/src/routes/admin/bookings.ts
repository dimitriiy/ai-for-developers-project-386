import { FastifyPluginAsync } from 'fastify';

const adminBookingsRoutes: FastifyPluginAsync = async (fastify) => {
  // GET /api/admin/bookings
  fastify.get('/', async (_request, reply) => {
    const bookings = await fastify.bookingService.listUpcoming();
    return reply.status(200).send(bookings);
  });
};

export default adminBookingsRoutes;
