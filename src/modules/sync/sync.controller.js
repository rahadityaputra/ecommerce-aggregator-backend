const asyncHandler = require('../../utils/asyncHandler');
const { ok } = require('../../utils/response');
const productSyncService = require('./product-sync.service');

const retrySync = asyncHandler(async (req, res) => {
  const result = await productSyncService.retrySyncLog(req.validated.params.syncLogId);

  return ok(res, result, 'Sync retry processed');
});

module.exports = {
  retrySync
};