const express = require("express");
const authMiddleware = require("../../middlewares/auth.middleware");
const controller = require("./webhooks.controller");

const router = express.Router();

/**
 * @openapi
 * /api/v1/mock/shopee/orders:
 *   post:
 *     tags: [Webhooks]
 *     summary: Mock Shopee order webhook
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               order_id:
 *                 type: string
 *                 example: SP-123456
 *               sku:
 *                 type: string
 *                 example: SKU-MOUSE-001
 *               qty:
 *                 type: integer
 *                 minimum: 1
 *                 example: 1
 *     responses:
 *       '200':
 *         description: Mock Shopee order queued
 * /api/v1/mock/tokopedia/orders:
 *   post:
 *     tags: [Webhooks]
 *     summary: Mock Tokopedia order webhook
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               order_id:
 *                 type: string
 *                 example: TP-123456
 *               sku:
 *                 type: string
 *                 example: SKU-MOUSE-001
 *               qty:
 *                 type: integer
 *                 minimum: 1
 *                 example: 1
 *     responses:
 *       '200':
 *         description: Mock Tokopedia order queued
 */
router.use(authMiddleware);
router.post("/shopee/orders", controller.mockShopeeOrder);
router.post("/tokopedia/orders", controller.mockTokopediaOrder);

module.exports = router;
