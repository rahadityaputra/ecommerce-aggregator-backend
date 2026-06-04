function ok(res, data, message = 'OK', meta = undefined) {
  return res.status(200).json({
    success: true,
    message,
    data,
    meta
  });
}

function created(res, data, message = 'Created') {
  return res.status(201).json({
    success: true,
    message,
    data
  });
}

function fail(res, statusCode, message, errors = undefined) {
  return res.status(statusCode).json({
    success: false,
    message,
    errors
  });
}

module.exports = {
  ok,
  created,
  fail
};
