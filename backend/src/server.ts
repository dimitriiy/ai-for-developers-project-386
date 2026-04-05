import Fastify from 'fastify';

const fastify = Fastify({
  logger: true,
});

const PORT: number = Number(process.env.PORT) || 3000;
const HOST: string = process.env.HOST || '0.0.0.0';

interface HealthResponse {
  status: string;
  timestamp: string;
}

interface RootResponse {
  message: string;
  version: string;
  documentation: string;
}

/**
 * Health check endpoint
 * @route GET /health
 */
fastify.get('/health', async (): Promise<HealthResponse> => {
  return { status: 'ok', timestamp: new Date().toISOString() };
});

/**
 * Root endpoint
 * @route GET /
 */
fastify.get('/', async (): Promise<RootResponse> => {
  return {
    message: 'Welcome to Fastify API',
    version: '1.0.0',
    documentation: '/health',
  };
});

/**
 * Start the server
 */
const start = async (): Promise<void> => {
  try {
    await fastify.listen({ port: PORT, host: HOST });
    fastify.log.info(`Server listening on http://${HOST}:${PORT}`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();
