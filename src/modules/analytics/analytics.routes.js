const express = require("express");
const authMiddleware = require("../../middlewares/auth.middleware");
const controller = require("./analytics.controller");

const router = express.Router();

/**
 * @openapi
 * /api/v1/analytics/summary:
 *   get:
 *     tags: [Analytics]
 *     summary: Get summary metrics for the dashboard
 *     parameters:
 *       - in: query
 *         name: range
 *         schema:
 *           type: string
 *         description: Date range (e.g., 7d, 30d)
 *       - in: query
 *         name: start_date
 *         schema:
 *           type: string
 *           format: date
 *         description: Custom start date (YYYY-MM-DD)
 *       - in: query
 *         name: end_date
 *         schema:
 *           type: string
 *           format: date
 *         description: Custom end date (YYYY-MM-DD)
 *     responses:
 *       '200':
 *         description: Analytics summary fetched successfully
 * 
 * /api/v1/analytics/sales:
 *   get:
 *     tags: [Analytics]
 *     summary: Get sales data for charting
 *     parameters:
 *       - in: query
 *         name: range
 *         schema:
 *           type: string
 *         description: Date range (e.g., 7d, 30d)
 *       - in: query
 *         name: start_date
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: end_date
 *         schema:
 *           type: string
 *           format: date
 *     responses:
 *       '200':
 *         description: Sales analytics fetched successfully
 * 
 * /api/v1/analytics/top-products:
 *   get:
 *     tags: [Analytics]
 *     summary: Get top selling products
 *     parameters:
 *       - in: query
 *         name: range
 *         schema:
 *           type: string
 *       - in: query
 *         name: start_date
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: end_date
 *         schema:
 *           type: string
 *           format: date
 *     responses:
 *       '200':
 *         description: Top products analytics fetched successfully
 * 
 * /api/v1/analytics/activities:
 *   get:
 *     tags: [Analytics]
 *     summary: Get recent system activities (sync logs, errors, etc.)
 *     parameters:
 *       - in: query
 *         name: range
 *         schema:
 *           type: string
 *       - in: query
 *         name: start_date
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: end_date
 *         schema:
 *           type: string
 *           format: date
 *     responses:
 *       '200':
 *         description: Activities fetched successfully
 */
router.use(authMiddleware);
router.get("/summary", controller.summary);
router.get("/sales", controller.sales);
router.get("/top-products", controller.topProducts);
router.get("/activities", controller.activities);

module.exports = router;
