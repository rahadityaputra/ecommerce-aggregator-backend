const asyncHandler = require('../../utils/asyncHandler');
const { ok } = require('../../utils/response');
const repository = require('./orders.repository');

const list = asyncHandler(async (req, res) => {
  const data = await repository.findMany(req.query);
  return ok(res, data.items, 'Orders fetched', data.meta);
});

const detail = asyncHandler(async (req, res) => {
  const row = await repository.findById(Number(req.params.id));
  return ok(res, row, 'Order fetched');
});

module.exports = {
  list,
  detail
};
