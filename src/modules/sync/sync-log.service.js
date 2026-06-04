const SyncLog = require('../sync-logs/sync-log.model');

async function createPendingLog({ productId = null, marketplace, action, requestPayload }) {
  return SyncLog.create({
    productId,
    marketplace,
    action,
    requestPayload,
    responsePayload: null,
    status: 'PENDING',
    errorMessage: null
  });
}

async function markSuccess(syncLogId, responsePayload) {
  return SyncLog.findByIdAndUpdate(
    syncLogId,
    {
      status: 'SUCCESS',
      responsePayload,
      errorMessage: null
    },
    { new: true }
  );
}

async function markFailed(syncLogId, errorMessage, responsePayload = null) {
  return SyncLog.findByIdAndUpdate(
    syncLogId,
    {
      status: 'FAILED',
      responsePayload,
      errorMessage
    },
    { new: true }
  );
}

async function findById(syncLogId) {
  return SyncLog.findById(syncLogId);
}

module.exports = {
  createPendingLog,
  markSuccess,
  markFailed,
  findById
};