const { notificationQueue } = require('../modules/queues/queue.registry');

async function pushNotification(payload) {
  return notificationQueue.add('notification', payload);
}

module.exports = {
  pushNotification
};
