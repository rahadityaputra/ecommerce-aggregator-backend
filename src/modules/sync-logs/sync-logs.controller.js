const asyncHandler = require('../../utils/asyncHandler');
const { ok } = require('../../utils/response');
const getPagination = require('../../utils/pagination');
const SyncLog = require('./sync-log.model');

const list = asyncHandler(async (req, res) => {
  const { skip, limit, page } = getPagination(req.query);
  const [items, total] = await Promise.all([
    SyncLog.find().sort({ createdAt: -1 }).skip(skip).limit(limit ?? 0),
    SyncLog.countDocuments()
  ]);

  return ok(res, items, 'Sync logs fetched', {
    page,
    limit,
    total,
    totalPages: limit === null ? 1 : Math.ceil(total / limit)
  });
});

module.exports = {
  list
};
