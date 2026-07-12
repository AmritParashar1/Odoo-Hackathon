import morgan from 'morgan';
import { env } from '../config/env';
import logger from '../shared/utils/logger';

/**
 * HTTP request logging middleware using Morgan.
 * - Development: colorized, concise format
 * - Production: combined format piped through Winston
 */
const stream = {
  write: (message: string) => {
    logger.info(message.trim());
  },
};

export const httpLogger = env.NODE_ENV === 'development'
  ? morgan('dev')
  : morgan('combined', { stream });
