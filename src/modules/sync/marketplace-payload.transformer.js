const MARKETPLACE_CODES = {
  shopee: 'SHP',
  tokopedia: 'TOK',
  lazada: 'LZD'
};

function compactObject(value) {
  return Object.fromEntries(
    Object.entries(value).filter(([, entryValue]) => entryValue !== undefined && entryValue !== null)
  );
}

function normalizeSkuSegment(value) {
  return String(value || '')
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function buildMarketplaceSku(marketplace, internalSku) {
  const prefix = MARKETPLACE_CODES[marketplace];
  const segment = normalizeSkuSegment(internalSku);

  if (!prefix) {
    return segment;
  }

  return segment ? `${prefix}-${segment}` : prefix;
}

function extractImageUrls(product) {
  return (product?.images || [])
    .map((image) => image?.imageUrl)
    .filter(Boolean);
}

function resolveThumbnailUrl(product, imageUrls) {
  return product?.imageUrl || imageUrls[0] || null;
}

function toNumber(value, fallback = 0) {
  if (value === undefined || value === null) {
    return fallback;
  }

  return Number(value);
}

function buildMarketplaceProductPayload(product, marketplaceSku) {
  const imageUrls = extractImageUrls(product);

  return compactObject({
    product_name: product.name,
    marketplace_sku: marketplaceSku,
    internal_sku: product.internalSku,
    description: product.description || '',
    category: product.category,
    brand: product.brand || '',
    price: toNumber(product.price, 0),
    stock: Number(product.stock || 0),
    weight: toNumber(product.weight, 0),
    thumbnail_url: resolveThumbnailUrl(product, imageUrls),
    status: product.status || 'DRAFT',
    images: imageUrls
  });
}

function buildMarketplaceStockPayload(product) {
  return {
    stock: Number(product.stock || 0)
  };
}

module.exports = {
  MARKETPLACE_CODES,
  buildMarketplaceSku,
  buildMarketplaceProductPayload,
  buildMarketplaceStockPayload
};