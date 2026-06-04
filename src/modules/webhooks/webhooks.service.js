const shopeeAdapter = require('../../adapters/shopee.adapter');
const tokopediaAdapter = require('../../adapters/tokopedia.adapter');
const lazadaAdapter = require('../../adapters/lazada.adapter');
const ApiError = require('../../utils/ApiError');

const adapters = {
  shopee: shopeeAdapter,
  tokopedia: tokopediaAdapter,
  lazada: lazadaAdapter
};

function normalize(source, payload) {
  const adapter = adapters[source];

  if (!adapter) {
    throw new ApiError(400, `Unsupported webhook source: ${source}`);
  }

  return adapter.normalizeOrder(payload);
}

module.exports = {
  normalize
};
