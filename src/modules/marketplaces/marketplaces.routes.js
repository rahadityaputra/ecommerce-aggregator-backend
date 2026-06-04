const express = require("express");
const authMiddleware = require("../../middlewares/auth.middleware");
const controller = require("./marketplaces.controller");

const router = express.Router();

/**
 * @openapi
 * /api/v1/marketplaces:
 *   get:
 *     tags: [Marketplaces]
 *     summary: Get marketplaces
 *     responses:
 *       '200':
 *         description: Marketplaces fetched
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Marketplaces fetched
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                       name:
 *                         type: string
 *                       isActive:
 *                         type: boolean
 * /api/v1/marketplaces/{id}/toggle:
 *   patch:
 *     tags: [Marketplaces]
 *     summary: Toggle marketplace status by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Marketplace ID
 *     responses:
 *       '200':
 *         description: Marketplace toggled
 *       '404':
 *         description: Marketplace not found
 */
router.use(authMiddleware);
router.get("/", controller.list);
router.patch("/:id/toggle", controller.toggle);

module.exports = router;
