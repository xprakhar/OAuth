import path from 'node:path';
import winston from 'winston';

const rootDir = process.env.PROJECT_DIR || '';

const logger = winston.createLogger({
  level: 'error',
  format: winston.format.json(),
  defaultMeta: { service: 'user-service' },
  transports: [
    //
    // - Write all logs with importance level of `error` or less to `error.log`
    // - Write all logs with importance level of `info` or less to `combined.log`
    //
    new winston.transports.File({
      level: 'error',
      filename: 'error.log',
      dirname: path.join(rootDir, 'logs'),
    }),
    new winston.transports.File({
      level: 'info',
      filename: 'combined.log',
      dirname: path.join(rootDir, 'logs'),
    }),
  ],
});

//
// If we're not in production then log to the `console` with the format:
// `${info.level}: ${info.message} JSON.stringify({ ...rest }) `
//
if (process.env.MODE !== 'production') {
  logger.add(
    new winston.transports.Console({
      format: winston.format.simple(),
    }),
  );
}

export { logger };
