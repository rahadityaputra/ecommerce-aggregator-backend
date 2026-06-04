const { z } = require("zod");

const productStatusSchema = z.enum(["ACTIVE", "DRAFT", "ARCHIVED"]);
const productImageArraySchema = z.array(z.string().min(1)).max(5);

const productBodySchema = z.object({
    name: z.string().min(1),
    internalSku: z.string().min(1),
    description: z.string().min(1),
    category: z.string().min(1),
    brand: z.string().min(1),
    price: z.coerce.number().positive(),
    stock: z.coerce.number().int().min(0),
    weight: z.coerce.number().nonnegative(),
    status: productStatusSchema.default("DRAFT"),
    images: productImageArraySchema.optional(),
});

const updateProductBodySchema = z.object({
    name: z.string().min(1).optional(),
    internalSku: z.string().min(1).optional(),
    description: z.string().min(1).optional(),
    category: z.string().min(1).optional(),
    brand: z.string().min(1).optional(),
    price: z.coerce.number().positive().optional(),
    stock: z.coerce.number().int().min(0).optional(),
    weight: z.coerce.number().nonnegative().optional(),
    status: productStatusSchema.optional(),
    images: productImageArraySchema.optional(),
});

const createProductSchema = z.object({
    body: productBodySchema,
    query: z.object({}).optional(),
    params: z.object({}).optional(),
});

const updateProductSchema = z.object({
    body: updateProductBodySchema,
    params: z.object({
        id: z.string().regex(/^\d+$/),
    }),
    query: z.object({}).optional(),
});

const updateStockSchema = z.object({
    body: z.object({
        stock: z.coerce.number().int().min(0),
    }),
    params: z.object({
        id: z.string().regex(/^\d+$/),
    }),
    query: z.object({}).optional(),
});

const getProductSchema = z.object({
    params: z.object({
        id: z.string().regex(/^\d+$/),
    }),
    query: z.object({}).optional(),
    body: z.object({}).optional(),
});

const deleteProductImageSchema = z.object({
    params: z.object({
        id: z.string().regex(/^\d+$/),
        imageId: z.string().regex(/^\d+$/),
    }),
    query: z.object({}).optional(),
    body: z.object({}).optional(),
});

const listProductsSchema = z.object({
    query: z.object({
        page: z.coerce.number().int().min(1).optional(),
        limit: z.coerce.number().int().min(1).max(100).optional(),
        search: z.string().min(1).optional(),
        category: z.string().min(1).optional(),
        status: productStatusSchema.optional(),
    }),
    params: z.object({}).optional(),
    body: z.object({}).optional(),
});

module.exports = {
    createProductSchema,
    updateProductSchema,
    updateStockSchema,
    getProductSchema,
    deleteProductImageSchema,
    listProductsSchema,
    productStatusSchema,
};
