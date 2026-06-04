const { prisma } = require("../../config/database");

const productInclude = {
    images: {
        orderBy: {
            id: "asc",
        },
    },
    mappings: {
        select: {
            id: true,
            marketplace: true,
            marketplaceSku: true,
            marketplaceProductId: true,
            internalSku: true,
            productId: true,
            createdAt: true,
            updatedAt: true,
        },
    },
};

async function findMany({ skip, limit, where }) {
    const [items, total] = await Promise.all([
        prisma.product.findMany({
            where,
            skip,
            // Jika limit null → undefined → Prisma ambil semua data
            take: limit ?? undefined,
            orderBy: { id: "desc" },
            include: productInclude,
        }),
        prisma.product.count({ where }),
    ]);

    return { items, total };
}

async function create(data) {
    return prisma.product.create({ data, include: productInclude });
}

async function updateById(id, data) {
    return prisma.product.update({
        where: { id },
        data,
        include: productInclude,
    });
}

async function updateStockById(id, stock) {
    return prisma.product.update({
        where: { id },
        data: { stock },
        include: productInclude,
    });
}

async function updateStockByInternalSku(internalSku, deltaQty) {
    return prisma.product.update({
        where: { internalSku },
        data: {
            stock: {
                decrement: deltaQty,
            },
        },
    });
}

async function findById(id) {
    return prisma.product.findUnique({
        where: { id },
        include: productInclude,
    });
}

async function createImages(productId, imageUrls) {
    if (!imageUrls.length) {
        return [];
    }

    await prisma.productImage.createMany({
        data: imageUrls.map((imageUrl) => ({ productId, imageUrl })),
    });

    return prisma.productImage.findMany({
        where: { productId },
        orderBy: { id: "asc" },
    });
}

async function replaceImages(productId, imageUrls) {
    await prisma.productImage.deleteMany({ where: { productId } });

    if (!imageUrls.length) {
        return [];
    }

    await prisma.productImage.createMany({
        data: imageUrls.map((imageUrl) => ({ productId, imageUrl })),
    });

    return prisma.productImage.findMany({
        where: { productId },
        orderBy: { id: "asc" },
    });
}

async function findImageById(productId, imageId) {
    return prisma.productImage.findFirst({
        where: { id: imageId, productId },
    });
}

async function deleteImageById(imageId) {
    return prisma.productImage.delete({
        where: { id: imageId },
    });
}

async function findImagesByProductId(productId) {
    return prisma.productImage.findMany({
        where: { productId },
        orderBy: { id: "asc" },
    });
}

async function archiveById(id) {
    return prisma.product.update({
        where: { id },
        data: { status: "ARCHIVED" },
        include: productInclude,
    });
}

module.exports = {
    findMany,
    create,
    updateById,
    updateStockById,
    updateStockByInternalSku,
    findById,
    createImages,
    replaceImages,
    findImageById,
    deleteImageById,
    findImagesByProductId,
    archiveById,
    productInclude,
};
