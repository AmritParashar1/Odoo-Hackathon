import 'dotenv/config';
import app from './app';
import { env } from './config/env';
import logger from './shared/utils/logger';
import prisma from './config/database';

async function main() {
  try {
    // Verify database connection
    await prisma.$connect();
    logger.info('✅ Database connected');

    // Start HTTP server
    const server = app.listen(env.PORT, () => {
      logger.info(`🚀 AssetFlow server running on port ${env.PORT}`);
      logger.info(`📍 Environment: ${env.NODE_ENV}`);
      logger.info(`🔗 Health check: http://localhost:${env.PORT}/health`);
      logger.info(`📡 API base: http://localhost:${env.PORT}/api/v1`);
    });

    // Graceful shutdown
    const gracefulShutdown = async (signal: string) => {
      logger.info(`\n${signal} received. Shutting down gracefully...`);

      server.close(async () => {
        await prisma.$disconnect();
        logger.info('✅ Database disconnected');
        logger.info('👋 Server shut down');
        process.exit(0);
      });

      // Force shutdown after 10s
      setTimeout(() => {
        logger.error('Forced shutdown after 10s timeout');
        process.exit(1);
      }, 10000);
    };

    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));

  } catch (error) {
    logger.error('❌ Failed to start server:', error);
    await prisma.$disconnect();
    process.exit(1);
  }
}

main();
