const createQueue = require('../../queues/queueFactory');
const QUEUE_NAMES = require('../../queues/queueNames');

const stockSyncQueue = createQueue(QUEUE_NAMES.STOCK_SYNC);
const retrySyncQueue = createQueue(QUEUE_NAMES.RETRY_SYNC);
const notificationQueue = createQueue(QUEUE_NAMES.NOTIFICATION);

module.exports = {
  stockSyncQueue,
  retrySyncQueue,
  notificationQueue
};
