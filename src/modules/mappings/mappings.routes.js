const express = require("express");
const authMiddleware = require("../../middlewares/auth.middleware");
const controller = require("./mappings.controller");

const router = express.Router();

/**
 * @openapi
 * /api/v1/mappings:
 *   get:
 *     tags: [Mappings]
 *     summary: Get mappings
 *     responses:
 *       '200':
 *         description: Mappings fetched
 *   post:
 *     tags: [Mappings]
 *     summary: Create mapping
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - marketplace
 *               - marketplaceSku
 *               - internalSku
 *             properties:
 *               marketplace:
 *                 type: string
 *                 example: shopee
 *               marketplaceSku:
 *                 type: string
 *                 example: SHP-ABC-001
 *               internalSku:
 *                 type: string
 *                 example: SKU-MOUSE-001
 *               productId:
 *                 type: integer
 *                 nullable: true
 *                 example: 1
 *     responses:
 *       '201':
 *         description: Mapping created
 *       '400':
 *         description: Validation error
 */
router.use(authMiddleware);
router.get("/", controller.list);
router.post("/", controller.create);

module.exports = router;
