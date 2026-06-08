const express = require('express');
const authRoutes = require('../modules/auth/auth.routes');
const productsRoutes = require('../modules/products/products.routes');
const marketplacesRoutes = require('../modules/marketplaces/marketplaces.routes');
const mappingsRoutes = require('../modules/mappings/mappings.routes');
const ordersRoutes = require('../modules/orders/orders.routes');
const webhooksRoutes = require('../modules/webhooks/webhooks.routes');
const syncLogsRoutes = require('../modules/sync-logs/sync-logs.routes');
const syncRoutes = require('../modules/sync/sync.routes');
const payloadLogsRoutes = require('../modules/payload-logs/payload-logs.routes');
const queuesRoutes = require('../modules/queues/queues.routes');
const analyticsRoutes = require('../modules/analytics/analytics.routes');

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/products', productsRoutes);
router.use('/marketplaces', marketplacesRoutes);
router.use('/mappings', mappingsRoutes);
router.use('/orders', ordersRoutes);
router.use('/webhooks', webhooksRoutes);
router.use('/sync', syncRoutes);
router.use('/sync-logs', syncLogsRoutes);
router.use('/payload-logs', payloadLogsRoutes);
router.use('/queues', queuesRoutes);
router.use('/analytics', analyticsRoutes);

module.exports = router;
