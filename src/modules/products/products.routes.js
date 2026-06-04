const express = require("express");
const validate = require("../../middlewares/validate.middleware");
const authMiddleware = require("../../middlewares/auth.middleware");
const controller = require("./products.controller");
const {
    createProductSchema,
    updateProductSchema,
    updateStockSchema,
    getProductSchema,
    deleteProductImageSchema,
    listProductsSchema,
} = require("./products.validation");
const { uploadProductImages } = require("./products.upload");

const router = express.Router();

router.use(authMiddleware);
router.post("/upload", uploadProductImages, controller.uploadImages);
router.get("/", validate(listProductsSchema), controller.getProducts);
router.post(
    "/:id/images",
    validate(getProductSchema),
    uploadProductImages,
    controller.addProductImages,
);
router.patch("/:id/stock", validate(updateStockSchema), controller.updateStock);
router.delete(
    "/:id/images/:imageId",
    validate(deleteProductImageSchema),
    controller.deleteProductImage,
);
router.get("/:id", validate(getProductSchema), controller.getProduct);
router.post("/", validate(createProductSchema), controller.createProduct);
router.patch("/:id", validate(updateProductSchema), controller.updateProduct);
router.delete("/:id", validate(getProductSchema), controller.deleteProduct);

module.exports = router;
