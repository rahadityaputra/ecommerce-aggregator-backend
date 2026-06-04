const asyncHandler = require('../../utils/asyncHandler');
const { ok, created } = require('../../utils/response');
const repo = require('./mappings.repository');

const list = asyncHandler(async (_req, res) => {
  const rows = await repo.findMany();
  return ok(res, rows, 'Mappings fetched');
});

const create = asyncHandler(async (req, res) => {
  const row = await repo.create(req.body);
  return created(res, row, 'Mapping created');
});

module.exports = {
  list,
  create
};
