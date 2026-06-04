const asyncHandler = require('../../utils/asyncHandler');
const { ok } = require('../../utils/response');
const { prisma } = require('../../config/database');
const SyncLog = require('../sync-logs/sync-log.model');

// Helper to parse date filters from query
function getDateFilter(query) {
  let startDate = new Date(0); // Default to epoch if no start date
  let endDate = new Date();

  if (query.range) {
    const days = parseInt(query.range.replace('d', ''));
    if (!isNaN(days)) {
      startDate = new Date();
      startDate.setDate(startDate.getDate() - days);
    }
  } else if (query.start_date && query.end_date) {
    startDate = new Date(query.start_date);
    endDate = new Date(query.end_date);
  } else if (query.start_date) {
    startDate = new Date(query.start_date);
  }

  return { startDate, endDate };
}

const summary = asyncHandler(async (req, res) => {
  const { startDate, endDate } = getDateFilter(req.query);

  // Calculate the duration of the current period to find the previous period
  const periodDuration = endDate.getTime() - startDate.getTime();
  const prevStartDate = new Date(startDate.getTime() - periodDuration);
  const prevEndDate = new Date(startDate.getTime() - 1); // just before startDate

  const [ordersSummary, prevOrdersSummary, activeMarketplaces, failedSyncCount] = await Promise.all([
    prisma.order.aggregate({
      _count: { _all: true },
      _sum: { totalPrice: true },
      where: {
        createdAt: { gte: startDate, lte: endDate },
        status: { not: 'FAILED' }
      }
    }),
    prisma.order.aggregate({
      _count: { _all: true },
      _sum: { totalPrice: true },
      where: {
        createdAt: { gte: prevStartDate, lte: prevEndDate },
        status: { not: 'FAILED' }
      }
    }),
    prisma.marketplace.count({
      where: { isActive: true }
    }),
    SyncLog.countDocuments({
      status: 'FAILED',
      createdAt: { $gte: startDate, $lte: endDate }
    })
  ]);

  const totalOrders = ordersSummary._count._all;
  const totalRevenue = Number(ordersSummary._sum.totalPrice || 0);
  const averageOrderValue = totalOrders > 0 ? (totalRevenue / totalOrders) : 0;

  const prevTotalOrders = prevOrdersSummary._count._all;
  const prevTotalRevenue = Number(prevOrdersSummary._sum.totalPrice || 0);

  // Calculate percentage growth
  const ordersGrowth = prevTotalOrders > 0 
    ? ((totalOrders - prevTotalOrders) / prevTotalOrders) * 100 
    : (totalOrders > 0 ? 100 : 0);
    
  const revenueGrowth = prevTotalRevenue > 0
    ? ((totalRevenue - prevTotalRevenue) / prevTotalRevenue) * 100
    : (totalRevenue > 0 ? 100 : 0);

  return ok(res, {
    total_orders: totalOrders,
    total_revenue: totalRevenue,
    active_marketplaces: activeMarketplaces,
    failed_sync_count: failedSyncCount,
    average_order_value: averageOrderValue,
    orders_growth: Math.round(ordersGrowth * 10) / 10,
    revenue_growth: Math.round(revenueGrowth * 10) / 10
  }, 'Analytics summary fetched');
});

const sales = asyncHandler(async (req, res) => {
  const { startDate, endDate } = getDateFilter(req.query);

  // Group by Date using $queryRaw for MySQL (use snake_case column names for raw SQL)
  const rawSales = await prisma.$queryRaw`
    SELECT 
      DATE(createdAt) as date, 
      SUM(total_price) as sales, 
      COUNT(*) as orders
    FROM orders
    WHERE createdAt >= ${startDate} AND createdAt <= ${endDate}
    GROUP BY DATE(createdAt)
    ORDER BY DATE(createdAt) ASC
  `;

  // Format the rawSales to strings/numbers since Prisma raw returns raw DB types (e.g. Decimal, BigInt)
  const dailySales = rawSales.map(row => ({
    date: row.date instanceof Date ? row.date.toISOString().split('T')[0] : String(row.date),
    sales: Number(row.sales || 0),
    orders: Number(row.orders || 0)
  }));

  // Comparison Pie Chart data
  const comparisonGroup = await prisma.order.groupBy({
    by: ['marketplace'],
    _sum: { totalPrice: true },
    where: {
      createdAt: { gte: startDate, lte: endDate }
    }
  });

  const comparison = comparisonGroup.map(row => ({
    name: row.marketplace,
    value: Number(row._sum.totalPrice || 0)
  }));

  return ok(res, {
    dailySales,
    comparison
  }, 'Sales analytics fetched');
});

const topProducts = asyncHandler(async (req, res) => {
  const { startDate, endDate } = getDateFilter(req.query);

  // Use raw query to accurately calculate revenue as SUM(qty * price) and use snake_case column names
  const rawTopProducts = await prisma.$queryRaw`
    SELECT 
      p.id as productId,
      p.internal_sku as sku,
      p.name,
      SUM(oi.qty) as sold,
      SUM(oi.qty * oi.price) as revenue
    FROM order_items oi
    JOIN products p ON p.id = oi.product_id
    WHERE oi.createdAt >= ${startDate} AND oi.createdAt <= ${endDate}
    GROUP BY p.id, p.internal_sku, p.name
    ORDER BY sold DESC
    LIMIT 10
  `;

  const result = rawTopProducts.map(row => ({
    productId: row.productId,
    sku: row.sku,
    name: row.name,
    sold: Number(row.sold || 0),
    revenue: Number(row.revenue || 0)
  }));

  return ok(res, result, 'Top products fetched');
});

const activities = asyncHandler(async (req, res) => {
  const { startDate, endDate } = getDateFilter(req.query);

  const recentLogs = await SyncLog.find({
    createdAt: { $gte: startDate, $lte: endDate }
  })
    .sort({ createdAt: -1 })
    .limit(20)
    .lean();

  // Format the logs for the frontend
  const result = recentLogs.map(log => ({
    id: log._id.toString(),
    type: log.action,
    marketplace: log.marketplace,
    status: log.status,
    message: log.errorMessage || `Processed ${log.action} successfully`,
    timestamp: log.createdAt
  }));

  return ok(res, result, 'Activities fetched');
});

module.exports = {
  summary,
  sales,
  topProducts,
  activities
};
