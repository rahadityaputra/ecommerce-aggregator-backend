const asyncHandler = require('../../utils/asyncHandler');
const { ok } = require('../../utils/response');
const getPagination = require('../../utils/pagination');
const PayloadLog = require('./payload-log.model');

const list = asyncHandler(async (req, res) => {
  const { skip, limit, page } = getPagination(req.query);
  const [items, total] = await Promise.all([
    PayloadLog.find().sort({ _id: -1 }).skip(skip).limit(limit ?? 0),
    PayloadLog.countDocuments()
  ]);

  return ok(res, items, 'Payload logs fetched', {
    page,
    limit,
    total,
    totalPages: limit === null ? 1 : Math.ceil(total / limit)
  });
});

module.exports = {
  list
};
