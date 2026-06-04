class ShopeeAdapter {
  normalizeOrder(payload) {
    const data = payload.data || {};
    return {
      marketplace: 'Shopee',
      order_id: data.ordersn || payload.order_id || payload.orderCode,
      sku: data.sku || payload.sku || payload.marketplace_sku,
      qty: Number(data.qty || payload.qty || 0)
    };
  }
}

module.exports = new ShopeeAdapter();
