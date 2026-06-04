const express = require("express");
const controller = require("./webhooks.controller");

const router = express.Router();

/**
 * @openapi
 * /api/v1/webhooks/shopee:
 *   post:
 *     tags: [Webhooks]
 *     summary: Receive Shopee webhook
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               shop_id:
 *                 type: integer
 *               code:
 *                 type: integer
 *               timestamp:
 *                 type: integer
 *               data:
 *                 type: object
 *                 properties:
 *                   ordersn:
 *                     type: string
 *                   status:
 *                     type: string
 *                   sku:
 *                     type: string
 *                   qty:
 *                     type: integer
 *     responses:
 *       '201':
 *         description: Shopee webhook accepted
 * /api/v1/webhooks/tokopedia:
 *   post:
 *     tags: [Webhooks]
 *     summary: Receive Tokopedia webhook
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               fs_id:
 *                 type: integer
 *               shop_id:
 *                 type: integer
 *               invoice_num:
 *                 type: string
 *               order_status:
 *                 type: integer
 *               products:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     sku:
 *                       type: string
 *                     price:
 *                       type: integer
 *                     quantity:
 *                       type: integer
 *     responses:
 *       '201':
 *         description: Tokopedia webhook accepted
 * /api/v1/webhooks/lazada:
 *   post:
 *     tags: [Webhooks]
 *     summary: Receive Lazada webhook
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               message_type:
 *                 type: integer
 *               site_id:
 *                 type: string
 *               seller_id:
 *                 type: string
 *               timestamp:
 *                 type: integer
 *               data:
 *                 type: object
 *                 properties:
 *                   trade_order_id:
 *                     type: string
 *                   order_status:
 *                     type: string
 *                   trade_order_lines:
 *                     type: array
 *                     items:
 *                       type: object
 *                       properties:
 *                         order_item_id:
 *                           type: integer
 *                         sku:
 *                           type: string
 *                         quantity:
 *                           type: integer
 *     responses:
 *       '201':
 *         description: Lazada webhook accepted
 */
router.post("/shopee", controller.handleShopee);
router.post("/tokopedia", controller.handleTokopedia);
router.post("/lazada", controller.handleLazada);

module.exports = router;
