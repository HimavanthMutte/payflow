import winston from 'winston';

const { combine, timestamp, json, colorize, simple } = winston.format;

export const logger = winston.createLogger({
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  format: combine(timestamp(), json()),
  defaultMeta: { service: 'payflow-backend' },
  transports: [
    new winston.transports.Console({
      format:
        process.env.NODE_ENV === 'production'
          ? json()
          : combine(colorize(), simple()),
    }),
  ],
});
