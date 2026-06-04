class LazadaAdapter {
  normalizeOrder(payload) {
    const data = payload.data || {};
    const item = data.trade_order_lines && data.trade_order_lines[0] ? data.trade_order_lines[0] : {};
    return {
      marketplace: 'Lazada',
      order_id: data.trade_order_id || payload.order_id || payload.orderNumber || payload.orderCode,
      sku: item.sku || payload.sku || payload.marketplace_sku,
      qty: Number(item.quantity || payload.qty || 0)
    };
  }
}

module.exports = new LazadaAdapter();
