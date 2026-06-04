const Redis = require('ioredis');
const env = require('./env');

const redis = new Redis({
  host: env.redisHost,
  port: env.redisPort,
  ...(env.redisPassword && { password: env.redisPassword }),
  maxRetriesPerRequest: null
});

module.exports = redis;
