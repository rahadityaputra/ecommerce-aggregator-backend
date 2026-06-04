const Redis = require('ioredis');
const env = require('./env');

const redis = new Redis({
  host: env.redisHost,
  port: env.redisPort,
  maxRetriesPerRequest: null
});

module.exports = redis;
