const asyncHandler = require("../../utils/asyncHandler");
const { ok, created } = require("../../utils/response");
const productsService = require("./products.service");
const ApiError = require("../../utils/ApiError");

const getProducts = asyncHandler(async (req, res) => {
    const result = await productsService.getProducts(req.validated.query);
    return ok(res, result.items, "Products fetched", result.meta);
});

const createProduct = asyncHandler(async (req, res) => {
    const product = await productsService.createProduct(req.validated.body);
    return created(res, product, "Product created");
});

const updateStock = asyncHandler(async (req, res) => {
    const updated = await productsService.updateStock(
        req.validated.params.id,
        req.validated.body.stock,
    );

    return ok(res, updated, "Stock updated");
});

const getProduct = asyncHandler(async (req, res) => {
    const product = await productsService.getProductById(
        req.validated.params.id,
    );

    return ok(res, product, "Product fetched");
});

const updateProduct = asyncHandler(async (req, res) => {
    const product = await productsService.updateProduct(
        req.validated.params.id,
        req.validated.body,
    );

    return ok(res, product, "Product updated");
});

const uploadImages = asyncHandler(async (req, res) => {
    const files = req.files || [];

    if (!files.length) {
        throw new ApiError(400, "At least one image file is required");
    }

    const images = await productsService.uploadImages(files);
    return res.status(200).json({ success: true, images });
});

const addProductImages = asyncHandler(async (req, res) => {
    const files = req.files || [];

    if (!files.length) {
        throw new ApiError(400, "At least one image file is required");
    }

    const product = await productsService.addProductImages(
        req.validated.params.id,
        files,
    );

    return ok(res, product, "Product images uploaded");
});

const deleteProductImage = asyncHandler(async (req, res) => {
    const product = await productsService.deleteProductImage(
        req.validated.params.id,
        req.validated.params.imageId,
    );

    return ok(res, product, "Product image deleted");
});

const deleteProduct = asyncHandler(async (req, res) => {
    const product = await productsService.deleteProduct(
        req.validated.params.id,
    );

    return ok(res, product, "Product archived");
});

module.exports = {
    getProducts,
    createProduct,
    updateStock,
    getProduct,
    updateProduct,
    uploadImages,
    addProductImages,
    deleteProductImage,
    deleteProduct,
};
