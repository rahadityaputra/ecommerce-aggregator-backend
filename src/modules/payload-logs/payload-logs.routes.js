const express = require("express");
const authMiddleware = require("../../middlewares/auth.middleware");
const controller = require("./payload-logs.controller");

const router = express.Router();

/**
 * @openapi
 * /api/v1/payload-logs:
 *   get:
 *     tags: [Payload Logs]
 *     summary: Get payload logs
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
 *         description: Payload logs fetched
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
