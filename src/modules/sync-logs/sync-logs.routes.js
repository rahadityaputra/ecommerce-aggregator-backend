const express = require("express");
const authMiddleware = require("../../middlewares/auth.middleware");
const controller = require("./sync-logs.controller");

const router = express.Router();

/**
 * @openapi
 * /api/v1/sync-logs:
 *   get:
 *     tags: [Sync Logs]
 *     summary: Get sync logs
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 10
 *     responses:
 *       '200':
 *         description: Sync logs fetched
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                 meta:
 *                   $ref: '#/components/schemas/PaginationMeta'
 */
router.use(authMiddleware);
router.get("/", controller.list);

module.exports = router;
