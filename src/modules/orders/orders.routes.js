const express = require("express");
const authMiddleware = require("../../middlewares/auth.middleware");
const controller = require("./orders.controller");

const router = express.Router();

/**
 * @openapi
 * /api/v1/orders:
 *   get:
 *     tags: [Orders]
 *     summary: Get orders
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
 *         description: Orders fetched
 * /api/v1/orders/{id}:
 *   get:
 *     tags: [Orders]
 *     summary: Get order detail
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Order ID
 *     responses:
 *       '200':
 *         description: Order fetched
 *       '404':
 *         description: Order not found
 */
router.use(authMiddleware);
router.get("/", controller.list);
router.get("/:id", controller.detail);

module.exports = router;
