const asyncHandler = require('../../utils/asyncHandler');
const { ok, created } = require('../../utils/response');
const webhooksService = require('./webhooks.service');
const PayloadLog = require('../payload-logs/payload-log.model');
const SyncLog = require('../sync-logs/sync-log.model');
const WebhookEvent = require('./webhook-event.model');
const { stockSyncQueue } = require('../queues/queue.registry');
const { emitEvent } = require('../../websocket/socket');
const logger = require('../../utils/logger');

async function processWebhook(source, payload) {
  logger.info({ source, payload }, `Received webhook from ${source.toUpperCase()}`);

  try {
    await PayloadLog.create({
      marketplace: source,
      event: 'webhook-received',
      payload
    });

    const event = await WebhookEvent.create({ source, payload, processed: false });

    const normalized = webhooksService.normalize(source, payload);
    logger.info({ source, normalized }, `Normalized webhook data for ${source.toUpperCase()}`);

    const job = await stockSyncQueue.add('stock-sync', normalized, {
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 2000
      }
    });

    await SyncLog.create({
      marketplace: normalized.marketplace,
      action: 'enqueue-stock-sync',
      status: 'PENDING',
      error: null
    });

    await WebhookEvent.updateOne({ _id: event._id }, { processed: true });

    emitEvent('new-order', normalized);

    logger.info({ 
      event: 'webhook_normalized_payload', 
      normalizedData: normalized 
    }, 'Webhook Normalized Payload');
    
    emitEvent('queue-updated', {
      queue: 'stock-sync',
      jobId: job.id,
      orderId: normalized.order_id
    });

    logger.info({ source, jobId: job.id, orderId: normalized.order_id }, `Webhook processed and queued successfully for ${source.toUpperCase()}`);

    return { normalized, jobId: job.id };
  } catch (error) {
    logger.error({ error: error.message, source, payload }, `Error processing webhook from ${source.toUpperCase()}`);
    throw error;
  }
}

const handleShopee = asyncHandler(async (req, res) => {
  logger.info({ body: req.body, query: req.query }, 'Received request at Shopee webhook handler');
  const data = await processWebhook('shopee', req.body);
  return created(res, data, 'Shopee webhook accepted');
});

const handleTokopedia = asyncHandler(async (req, res) => {
  logger.info({ body: req.body, query: req.query }, 'Received request at Tokopedia webhook handler');
  const data = await processWebhook('tokopedia', req.body);
  return created(res, data, 'Tokopedia webhook accepted');
});

const handleLazada = asyncHandler(async (req, res) => {
  logger.info({ body: req.body, query: req.query }, 'Received request at Lazada webhook handler');
  const data = await processWebhook('lazada', req.body);
  return created(res, data, 'Lazada webhook accepted');
});

module.exports = {
  handleShopee,
  handleTokopedia,
  handleLazada
};
