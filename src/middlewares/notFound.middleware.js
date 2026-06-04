const ApiError = require('../utils/ApiError');

function notFoundMiddleware(req, _res, next) {
  next(new ApiError(404, `Route ${req.originalUrl} not found`));
}

module.exports = notFoundMiddleware;
