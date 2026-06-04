const { Worker } = require('bullmq');
const redis = require('../../config/redis');
const QUEUE_NAMES = require('../../queues/queueNames');
const logger = require('../../utils/logger');
const { emitEvent } = require('../../websocket/socket');
const syncService = require('../sync/sync.service');
const SyncLog = require('../sync-logs/sync-log.model');

function buildWorker(name, processor) {
  return new Worker(name, processor, { connection: redis });
}

function startWorkers() {
  const stockSyncWorker = buildWorker(QUEUE_NAMES.STOCK_SYNC, async (job) => {
    const result = await syncService.updateStockMarketplace(job.data);

    await SyncLog.create({
      productId: result.id || null,
      marketplace: job.data.marketplace,
      action: 'update-stock',
      requestPayload: job.data,
      responsePayload: result,
      status: 'SUCCESS',
      errorMessage: null
    });

    emitEvent('stock-updated', result);
    return result;
  });

  stockSyncWorker.on('failed', async (job, err) => {
    logger.error({ jobId: job?.id, error: err.message }, 'stock-sync failed');

    await SyncLog.create({
      productId: null,
      marketplace: job?.data?.marketplace || 'unknown',
      action: 'update-stock',
      requestPayload: job?.data || null,
      responsePayload: null,
      status: 'FAILED',
      errorMessage: err.message
    });

    emitEvent('marketplace-sync-failed', { jobId: job?.id, error: err.message });
  });

  const retrySyncWorker = buildWorker(QUEUE_NAMES.RETRY_SYNC, async (job) => {
    await syncService.retryFailedSync(job.data);
    emitEvent('queue-updated', { queue: QUEUE_NAMES.RETRY_SYNC, jobId: job.id });
    return { retried: true };
  });

  const notificationWorker = buildWorker(QUEUE_NAMES.NOTIFICATION, async (job) => {
    emitEvent('queue-updated', { queue: QUEUE_NAMES.NOTIFICATION, payload: job.data });
    return { sent: true };
  });

  logger.info('BullMQ workers started');

  return { stockSyncWorker, retrySyncWorker, notificationWorker };
}

module.exports = startWorkers;
