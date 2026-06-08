const asyncHandler = require('../../utils/asyncHandler');
const { ok } = require('../../utils/response');
const productSyncService = require('./product-sync.service');

const ApiError = require('../../utils/ApiError');
const productsRepository = require('../products/products.repository');

const retrySync = asyncHandler(async (req, res) => {
  const result = await productSyncService.retrySyncLog(req.validated.params.syncLogId);

  return ok(res, result, 'Sync retry processed');
});

const triggerStockSync = asyncHandler(async (req, res) => {
  const productId = Number(req.validated.params.productId);
  const product = await productsRepository.findById(productId);
  
  if (!product) {
    throw new ApiError(404, 'Product not found');
  }

  const result = await productSyncService.syncProductMutation('stock', product);
  return ok(res, result, 'Stock sync triggered manually');
});

module.exports = {
  retrySync,
  triggerStockSync
};