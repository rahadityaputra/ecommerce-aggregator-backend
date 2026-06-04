const { prisma } = require("../../config/database");

async function findMany() {
    return prisma.mapping.findMany({ orderBy: { id: "desc" } });
}

async function create(data) {
    return prisma.mapping.create({ data });
}

async function updateById(id, data) {
    return prisma.mapping.update({
        where: { id },
        data,
    });
}

async function findByMarketplaceAndSku(marketplace, marketplaceSku) {
    return prisma.mapping.findUnique({
        where: {
            marketplace_marketplaceSku: { marketplace, marketplaceSku },
        },
    });
}

async function findByProductIdAndMarketplace(productId, marketplace) {
    return prisma.mapping.findFirst({
        where: {
            productId,
            marketplace,
        },
    });
}

module.exports = {
    findMany,
    create,
    updateById,
    findByMarketplaceAndSku,
    findByProductIdAndMarketplace,
};
