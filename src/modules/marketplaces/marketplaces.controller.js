const asyncHandler = require('../../utils/asyncHandler');
const { ok } = require('../../utils/response');
const repo = require('./marketplaces.repository');

const list = asyncHandler(async (_req, res) => {
  const data = await repo.findMany();
  return ok(res, data, 'Marketplaces fetched');
});

const toggle = asyncHandler(async (req, res) => {
  const data = await repo.toggle(Number(req.params.id));
  return ok(res, data, 'Marketplace toggled');
});

module.exports = {
  list,
  toggle
};
