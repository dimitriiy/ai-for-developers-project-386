// backend/src/app.ts

import Fastify, { FastifyInstance } from "fastify";
import cors from "@fastify/cors";
import fastifyStatic from "@fastify/static";
import { initDb } from "./db/database.js";
import { EventTypeRepo } from "./db/repositories/eventTypeRepo.js";
import { BookingRepo } from "./db/repositories/bookingRepo.js";
import { EventTypeService } from "./services/eventTypeService.js";
import { BookingService } from "./services/bookingService.js";
import { SlotService } from "./services/slotService.js";
import "./types.js";

import adminEventTypesRoutes from "./routes/admin/eventTypes.js";
import adminBookingsRoutes from "./routes/admin/bookings.js";
import guestEventTypesRoutes from "./routes/guest/eventTypes.js";
import guestSlotsRoutes from "./routes/guest/slots.js";
import guestBookingsRoutes from "./routes/guest/bookings.js";
import path from "node:path";

export const buildApp = async (): Promise<FastifyInstance> => {
  const fastify = Fastify({ logger: true });

  // CORS
  await fastify.register(cors, { origin: true });

  // Database
  const db = await initDb();

  // Repositories
  const eventTypeRepo = new EventTypeRepo(db);
  const bookingRepo = new BookingRepo(db);

  // Services — decorate onto Fastify instance
  fastify.decorate("eventTypeService", new EventTypeService(eventTypeRepo));
  fastify.decorate(
    "bookingService",
    new BookingService(bookingRepo, eventTypeRepo),
  );
  fastify.decorate("slotService", new SlotService(eventTypeRepo, bookingRepo));

  // Health check
  fastify.get("/health", async () => {
    return { status: "ok", timestamp: new Date().toISOString() };
  });

  // Routes
  await fastify.register(adminEventTypesRoutes, {
    prefix: "/api/admin/event-types",
  });
  await fastify.register(adminBookingsRoutes, {
    prefix: "/api/admin/bookings",
  });
  await fastify.register(guestEventTypesRoutes, { prefix: "/api/event-types" });
  await fastify.register(guestSlotsRoutes, {
    prefix: "/api/event-types/:eventTypeId/slots",
  });
  await fastify.register(guestBookingsRoutes, { prefix: "/api/bookings" });

  const publicDir = path.join(process.cwd(), "public");

  await fastify.register(fastifyStatic, {
    root: publicDir,
    prefix: "/",
  });

  fastify.setNotFoundHandler((request, reply) => {
    if (request.url.startsWith("/api")) {
      return reply.code(404).send({ message: "API route not found" });
    }

    return reply.sendFile("index.html");
  });

  return fastify;
};
