const { prisma } = require('../../config/database');
const getPagination = require('../../utils/pagination');

async function findMany(query) {
  const { skip, limit, page } = getPagination(query);

  const [items, total] = await Promise.all([
    prisma.order.findMany({
      skip,
      take: limit ?? undefined,
      orderBy: { id: 'desc' },
      include: { items: true }
    }),
    prisma.order.count()
  ]);

  return {
    items,
    meta: {
      page,
      limit,
      total,
      totalPages: limit === null ? 1 : Math.ceil(total / limit)
    }
  };
}

async function findById(id) {
  if (!id) return null;
  return prisma.order.findUnique({
    where: { id },
    include: {
      items: {
        include: {
          product: true
        }
      }
    }
  });
}

async function findByOrderCode(orderCode) {
  if (!orderCode) return null;
  return prisma.order.findUnique({
    where: { orderCode }
  });
}

async function createOrderWithStockUpdate(data, mapping, productPrice) {
  return prisma.$transaction(async (tx) => {
    // 1. Decrement the product stock
    const product = await tx.product.update({
      where: { internalSku: mapping.internalSku },
      data: {
        stock: { decrement: data.qty }
      }
    });

    // 2. Create the order and order items
    const totalPrice = productPrice * data.qty;
    const order = await tx.order.create({
      data: {
        marketplace: data.marketplace,
        orderCode: data.order_id,
        status: 'CREATED',
        totalPrice: totalPrice,
        items: {
          create: [
            {
              productId: mapping.productId,
              qty: data.qty,
              price: productPrice
            }
          ]
        }
      },
      include: { items: true }
    });

    return { product, order };
  });
}

module.exports = {
  findMany,
  findById,
  findByOrderCode,
  createOrderWithStockUpdate
};
