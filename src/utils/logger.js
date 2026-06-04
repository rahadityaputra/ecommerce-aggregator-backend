const pino = require('pino');
const env = require('../config/env');

const logger = pino({
  level: env.logLevel,
  transport:
    env.nodeEnv !== 'production'
      ? {
          target: 'pino-pretty',
          options: {
            colorize: true,
            translateTime: true
          }
        }
      : undefined
});

module.exports = logger;
