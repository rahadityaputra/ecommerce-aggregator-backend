const express = require('express');
const authMiddleware = require('../../middlewares/auth.middleware');
const validate = require('../../middlewares/validate.middleware');
const controller = require('./sync.controller');
const { retrySyncSchema } = require('./sync.validation');

const router = express.Router();

router.use(authMiddleware);
router.post('/retry/:syncLogId', validate(retrySyncSchema), controller.retrySync);

module.exports = router;