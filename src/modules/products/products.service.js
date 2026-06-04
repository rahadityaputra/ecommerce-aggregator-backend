const productsRepository = require("./products.repository");
const getPagination = require("../../utils/pagination");
const ApiError = require("../../utils/ApiError");
const { uploadImagesToGCP, removeUploadedImage } = require("./products.upload");
const { prisma } = require("../../config/database");
const productSyncService = require("../sync/product-sync.service");

function slugify(value) {
    return value
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");
}

function buildSlug(product) {
    return `${slugify(product.name)}-${product.id}`;
}

function serializeProduct(product, { includeMappings = false } = {}) {
    if (!product) {
        return product;
    }

    const images = (product.images || []).map((image) => image.imageUrl);

    const response = {
        id: product.id,
        name: product.name,
        internalSku: product.internalSku,
        description: product.description,
        category: product.category,
        brand: product.brand,
        price: product.price,
        stock: product.stock,
        weight: product.weight,
        imageUrl: product.imageUrl,
        images,
        status: product.status,
        slug: buildSlug(product),
        createdAt: product.createdAt,
        updatedAt: product.updatedAt,
    };

    if (includeMappings) {
        response.marketplaceMappings = product.mappings || [];
        response.stockInfo = {
            stock: product.stock,
        };
    }

    return response;
}

async function loadProductOrThrow(id) {
    const product = await productsRepository.findById(Number(id));

    if (!product) {
        throw new ApiError(404, "Product not found");
    }

    return product;
}

function buildWhere(query) {
    const where = {};

    if (query.search) {
        where.OR = [
            { name: { contains: query.search } },
            { internalSku: { contains: query.search } },
            { description: { contains: query.search } },
            { category: { contains: query.search } },
            { brand: { contains: query.search } },
        ];
    }

    if (query.category) {
        where.category = query.category;
    }

    if (query.status) {
        where.status = query.status;
    }

    return where;
}

async function getProducts(query) {
    const { skip, limit, page } = getPagination(query);
    const where = buildWhere(query);
    const { items, total } = await productsRepository.findMany({
        skip,
        limit,
        where,
    });

    return {
        items: items.map((item) => serializeProduct(item)),
        meta: {
            page,
            limit,
            total,
            totalPages: limit === null ? 1 : Math.ceil(total / limit),
        },
    };
}

async function createProduct(payload) {
    const imageUrls = payload.images || [];

    const createRecord = async (tx, userId = undefined) => {
        const created = await tx.product.create({
            data: {
                name: payload.name,
                internalSku: payload.internalSku,
                description: payload.description,
                category: payload.category,
                brand: payload.brand,
                price: payload.price,
                stock: payload.stock,
                weight: payload.weight,
                imageUrl: imageUrls[0] || null,
                status: payload.status || "DRAFT",
                ...(userId ? { user: { connect: { id: userId } } } : {}),
            },
            include: productsRepository.productInclude,
        });

        if (imageUrls.length) {
            await tx.productImage.createMany({
                data: imageUrls.map((imageUrl) => ({
                    productId: created.id,
                    imageUrl,
                })),
            });
        }

        return tx.product.findUnique({
            where: { id: created.id },
            include: productsRepository.productInclude,
        });
    };

    const createWithoutLegacyUser = async () =>
        prisma.$transaction(async (tx) => createRecord(tx));
    const createWithLegacyUser = async (legacyUserId) =>
        prisma.$transaction(async (tx) => createRecord(tx, legacyUserId));

    let product;

    try {
        product = await createWithoutLegacyUser();
    } catch (error) {
        if (
            !String(error?.message || "").includes("Argument `user` is missing")
        ) {
            throw error;
        }

        const legacyUser = await prisma.user.findFirst({
            orderBy: { id: "asc" },
            select: { id: true },
        });

        if (!legacyUser) {
            throw new ApiError(
                500,
                "No user available for legacy product creation fallback",
            );
        }

        product = await createWithLegacyUser(legacyUser.id);
    }

    await productSyncService.syncProductMutation("create", product);

    return serializeProduct(product);
}

async function updateProduct(id, payload) {
    const currentProduct = await loadProductOrThrow(id);
    const imageUrls = payload.images;

    const updatedProduct = await prisma.$transaction(async (tx) => {
        if (imageUrls !== undefined) {
            await tx.productImage.deleteMany({
                where: { productId: currentProduct.id },
            });

            if (imageUrls.length) {
                await tx.productImage.createMany({
                    data: imageUrls.map((imageUrl) => ({
                        productId: currentProduct.id,
                        imageUrl,
                    })),
                });
            }
        }

        return tx.product.update({
            where: { id: currentProduct.id },
            data: {
                name: payload.name,
                internalSku: payload.internalSku,
                description: payload.description,
                category: payload.category,
                brand: payload.brand,
                price: payload.price,
                stock: payload.stock,
                weight: payload.weight,
                status: payload.status,
                imageUrl:
                    imageUrls !== undefined ? imageUrls[0] || null : undefined,
            },
            include: productsRepository.productInclude,
        });
    });

    await productSyncService.syncProductMutation("update", updatedProduct);

    return serializeProduct(updatedProduct);
}

async function updateStock(id, stock) {
    const updated = await productsRepository.updateStockById(Number(id), stock);
    await productSyncService.syncProductMutation("stock", updated);
    return serializeProduct(updated);
}

async function getProductById(id) {
    const product = await productsRepository.findById(Number(id));

    if (!product) {
        throw new ApiError(404, "Product not found");
    }

    return serializeProduct(product, { includeMappings: true });
}

async function uploadImages(files) {
    return await uploadImagesToGCP(files);
}

async function addProductImages(id, files) {
    const product = await loadProductOrThrow(id);
    const imageUrls = await uploadImagesToGCP(files);

    const updatedProduct = await prisma.$transaction(async (tx) => {
        if (!product.imageUrl && imageUrls.length) {
            await tx.product.update({
                where: { id: product.id },
                data: { imageUrl: imageUrls[0] },
            });
        }

        await tx.productImage.createMany({
            data: imageUrls.map((imageUrl) => ({
                productId: product.id,
                imageUrl,
            })),
        });

        return tx.product.findUnique({
            where: { id: product.id },
            include: productsRepository.productInclude,
        });
    });

    await productSyncService.syncProductMutation("update", updatedProduct);

    return serializeProduct(updatedProduct);
}

async function deleteProductImage(productId, imageId) {
    const product = await loadProductOrThrow(productId);
    const image = await productsRepository.findImageById(
        product.id,
        Number(imageId),
    );

    if (!image) {
        throw new ApiError(404, "Product image not found");
    }

    await removeUploadedImage(image.imageUrl);
    await productsRepository.deleteImageById(image.id);

    const remainingImages = await productsRepository.findImagesByProductId(
        product.id,
    );

    if (product.imageUrl === image.imageUrl) {
        await productsRepository.updateById(product.id, {
            imageUrl: remainingImages[0]?.imageUrl || null,
        });
    }

    const refreshedProduct = await productsRepository.findById(product.id);

    await productSyncService.syncProductMutation("update", refreshedProduct);
    return serializeProduct(refreshedProduct);
}

async function deleteProduct(id) {
    const archived = await productsRepository.archiveById(Number(id));
    await productSyncService.syncProductMutation("archive", archived);
    return serializeProduct(archived);
}

module.exports = {
    getProducts,
    createProduct,
    updateProduct,
    updateStock,
    getProductById,
    uploadImages,
    addProductImages,
    deleteProductImage,
    deleteProduct,
    serializeProduct,
};
