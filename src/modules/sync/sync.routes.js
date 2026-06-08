const express = require('express');
const authMiddleware = require('../../middlewares/auth.middleware');
const validate = require('../../middlewares/validate.middleware');
const controller = require('./sync.controller');
const { retrySyncSchema, triggerStockSyncSchema } = require('./sync.validation');

const router = express.Router();

/**
 * @openapi
 * /api/v1/sync/retry/{syncLogId}:
 *   post:
 *     tags: [Sync]
 *     summary: Retry a failed sync operation
 *     parameters:
 *       - in: path
 *         name: syncLogId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       '200':
 *         description: Sync retry processed successfully
 *       '400':
 *         description: Bad request
 *       '404':
 *         description: Sync log not found
 * 
 * /api/v1/sync/stock/{productId}:
 *   post:
 *     tags: [Sync]
 *     summary: Trigger manual stock sync for a product
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       '200':
 *         description: Stock sync triggered successfully
 *       '404':
 *         description: Product not found
 */
router.use(authMiddleware);
router.post('/retry/:syncLogId', validate(retrySyncSchema), controller.retrySync);
router.post('/stock/:productId', validate(triggerStockSyncSchema), controller.triggerStockSync);

module.exports = router;