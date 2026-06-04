const ApiError = require('../../utils/ApiError');
const mappingsRepository = require('../mappings/mappings.repository');
const productsRepository = require('../products/products.repository');
const ordersRepository = require('../orders/orders.repository');
const { stockSyncQueue } = require('../queues/queue.registry');

const productSyncService = require('./product-sync.service');

async function updateStockMarketplace(data) {
  if (!data || !data.order_id) {
    throw new ApiError(400, 'Order ID is required');
  }
  if (!data.marketplace) {
    throw new ApiError(400, 'Marketplace is required');
  }
  if (!data.sku) {
    throw new ApiError(400, 'SKU is required');
  }

  // Idempotency check: if order already exists, skip processing
  const existingOrder = await ordersRepository.findByOrderCode(data.order_id);
  if (existingOrder) {
    return {
      marketplace: data.marketplace,
      message: `Order ${data.order_id} already processed`,
      skipped: true
    };
  }

  const mapping = await mappingsRepository.findByMarketplaceAndSku(
    data.marketplace,
    data.sku
  );

  if (!mapping) {
    throw new ApiError(
      404,
      `Mapping not found for ${data.marketplace}:${data.sku}`
    );
  }

  const productInfo = await productsRepository.findById(mapping.productId);
  if (!productInfo) {
    throw new ApiError(404, `Product not found for mapping ${mapping.id}`);
  }

  const result = await ordersRepository.createOrderWithStockUpdate(
    data, 
    mapping, 
    productInfo.price
  );

  // Sinkronkan stok terbaru ke semua marketplace (secara paralel)
  // `syncProductMutation` akan mengurus pembuatan log (SyncLog) dan notifikasi realtime
  await productSyncService.syncProductMutation('stock', result.product);

  return {
    marketplace: data.marketplace,
    internalSku: mapping.internalSku,
    updatedStock: result.product.stock,
    orderId: result.order.id,
    id: result.product.id
  };
}

async function retryFailedSync(data) {
  await stockSyncQueue.add('stock-sync', data, {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 3000
    }
  });
}

module.exports = {
  updateStockMarketplace,
  retryFailedSync
};
