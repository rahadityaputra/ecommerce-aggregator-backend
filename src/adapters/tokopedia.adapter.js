class TokopediaAdapter {
  normalizeOrder(payload) {
    const product = payload.products && payload.products[0] ? payload.products[0] : {};
    return {
      marketplace: 'Tokopedia',
      order_id: payload.invoice_num || payload.order_id || payload.orderCode,
      sku: product.sku || payload.sku || payload.marketplace_sku,
      qty: Number(product.quantity || payload.qty || 0)
    };
  }
}

module.exports = new TokopediaAdapter();
