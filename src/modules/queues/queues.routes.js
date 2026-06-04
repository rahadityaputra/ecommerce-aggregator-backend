const express = require("express");
const authMiddleware = require("../../middlewares/auth.middleware");
const controller = require("./queues.controller");

const router = express.Router();

/**
 * @openapi
 * /api/v1/queues:
 *   get:
 *     tags: [Queues]
 *     summary: Get queue job counts
 *     responses:
 *       '200':
 *         description: Queue counts fetched
 * /api/v1/queues/{id}/retry:
 *   post:
 *     tags: [Queues]
 *     summary: Retry a failed job
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: BullMQ job ID
 *     responses:
 *       '200':
 *         description: Retry job enqueued or job not found
 */
router.use(authMiddleware);
router.get("/", controller.listQueues);
router.post("/:id/retry", controller.retryJob);

module.exports = router;
